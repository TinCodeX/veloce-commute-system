import logging
import uuid
from typing import Optional, Tuple, Dict, Any
import jwt
from jwt import PyJWKClient, PyJWTError
from django.conf import settings
from django.db import transaction
from rest_framework import authentication, exceptions
from core.models import User, CommuterRole, CommuterProfile, DriverProfile, CorporateProfile

logger = logging.getLogger(__name__)


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Production-grade Supabase JWT Authentication for Django REST Framework.
    
    Verifies Supabase JWT tokens via either:
    1. Symmetric HMAC (HS256) using SUPABASE_JWT_SECRET.
    2. Asymmetric RSA/ECDSA (RS256/ES256) via Supabase JWKS endpoint.
    
    On successful verification, resolves or idempotently auto-provisions
    the custom Django User and domain profile (Passenger, Driver, or Corporate).
    """

    _jwks_client: Optional[PyJWKClient] = None

    @classmethod
    def get_jwks_client(cls) -> Optional[PyJWKClient]:
        if cls._jwks_client is None and getattr(settings, 'SUPABASE_URL', None):
            jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
            try:
                cls._jwks_client = PyJWKClient(jwks_url, cache_keys=True, max_cached_keys=16)
            except Exception as e:
                logger.warning(f"Failed to initialize JWKS client for {jwks_url}: {e}")
        return cls._jwks_client

    def authenticate(self, request) -> Optional[Tuple[User, Dict[str, Any]]]:
        auth_header = authentication.get_authorization_header(request).split()

        if not auth_header:
            return None

        if len(auth_header) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(auth_header) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

        prefix = auth_header[0].decode('utf-8')
        if prefix.lower() != 'bearer':
            return None

        raw_token = auth_header[1].decode('utf-8')
        return self.authenticate_credentials(raw_token)

    def authenticate_credentials(self, token: str) -> Tuple[User, Dict[str, Any]]:
        payload = self.verify_token(token)
        user = self.get_or_create_user(payload)
        return (user, payload)

    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Cryptographically decodes and verifies the Supabase JWT.
        """
        try:
            # Unverified header inspection to check algorithm
            unverified_header = jwt.get_unverified_header(token)
            alg = unverified_header.get('alg', 'HS256')
        except PyJWTError as e:
            raise exceptions.AuthenticationFailed(f'Invalid JWT token format: {str(e)}')

        jwt_secret = getattr(settings, 'SUPABASE_JWT_SECRET', '')
        supabase_url = getattr(settings, 'SUPABASE_URL', '')
        audience = getattr(settings, 'SUPABASE_AUDIENCE', 'authenticated')

        expected_issuer = f"{supabase_url.rstrip('/')}/auth/v1" if supabase_url else None

        # Verification options
        decode_options = {
            'verify_signature': True,
            'verify_exp': True,
            'verify_nbf': True,
            'verify_aud': True if audience else False,
            'verify_iss': True if expected_issuer else False,
        }

        # Symmetric verification (HS256)
        if alg.startswith('HS') and jwt_secret:
            try:
                payload = jwt.decode(
                    token,
                    jwt_secret,
                    algorithms=[alg],
                    audience=audience if audience else None,
                    issuer=expected_issuer,
                    options=decode_options,
                    leeway=10
                )
                return payload
            except jwt.ExpiredSignatureError:
                raise exceptions.AuthenticationFailed('Supabase JWT token has expired.')
            except jwt.InvalidAudienceError:
                raise exceptions.AuthenticationFailed('Supabase JWT token audience is invalid.')
            except jwt.InvalidIssuerError:
                raise exceptions.AuthenticationFailed('Supabase JWT token issuer is invalid.')
            except jwt.InvalidSignatureError:
                raise exceptions.AuthenticationFailed('Supabase JWT signature verification failed.')
            except PyJWTError as e:
                raise exceptions.AuthenticationFailed(f'Supabase JWT validation error: {str(e)}')

        # Asymmetric verification (RS256 / ES256) via JWKS
        elif alg.startswith(('RS', 'ES')):
            jwks_client = self.get_jwks_client()
            if not jwks_client:
                raise exceptions.AuthenticationFailed(
                    'Asymmetric JWT received but Supabase JWKS client is not configured.'
                )
            try:
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=[alg],
                    audience=audience if audience else None,
                    issuer=expected_issuer,
                    options=decode_options,
                    leeway=10
                )
                return payload
            except jwt.ExpiredSignatureError:
                raise exceptions.AuthenticationFailed('Supabase JWT token has expired.')
            except jwt.InvalidAudienceError:
                raise exceptions.AuthenticationFailed('Supabase JWT token audience is invalid.')
            except jwt.InvalidIssuerError:
                raise exceptions.AuthenticationFailed('Supabase JWT token issuer is invalid.')
            except jwt.InvalidSignatureError:
                raise exceptions.AuthenticationFailed('Supabase JWT signature verification failed.')
            except PyJWTError as e:
                raise exceptions.AuthenticationFailed(f'Supabase JWKS token validation error: {str(e)}')

        else:
            # Fallback if secret is configured
            if jwt_secret:
                try:
                    payload = jwt.decode(
                        token,
                        jwt_secret,
                        algorithms=['HS256', 'HS384', 'HS512'],
                        audience=audience if audience else None,
                        issuer=expected_issuer,
                        options=decode_options,
                        leeway=10
                    )
                    return payload
                except PyJWTError as e:
                    raise exceptions.AuthenticationFailed(f'Supabase JWT verification failed: {str(e)}')

            raise exceptions.AuthenticationFailed(
                'Unsupported JWT algorithm or missing SUPABASE_JWT_SECRET in settings.'
            )

    def get_or_create_user(self, payload: Dict[str, Any]) -> User:
        """
        Resolves or provisions a Django custom user and commuter profile from Supabase claims.
        """
        sub = payload.get('sub')
        if not sub:
            raise exceptions.AuthenticationFailed('Supabase JWT payload is missing "sub" (UUID) claim.')

        try:
            supabase_uid = uuid.UUID(str(sub))
        except (ValueError, TypeError):
            raise exceptions.AuthenticationFailed('Supabase "sub" claim is not a valid UUID.')

        email = payload.get('email', '').strip().lower()
        if not email:
            # Fallback for anonymous or phone-only users
            email = f"{supabase_uid}@commuter.veloce.internal"

        user_metadata = payload.get('user_metadata', {}) or {}
        app_metadata = payload.get('app_metadata', {}) or {}

        # Determine commuter role (metadata > app_metadata > default passenger)
        raw_role = (
            user_metadata.get('role')
            or app_metadata.get('role')
            or payload.get('role', '')
        ).lower()

        if raw_role in [CommuterRole.DRIVER, 'driver']:
            role = CommuterRole.DRIVER
        elif raw_role in [CommuterRole.CORPORATE, 'corporate', 'b2b']:
            role = CommuterRole.CORPORATE
        else:
            role = CommuterRole.PASSENGER

        full_name = user_metadata.get('full_name', '') or user_metadata.get('name', '')
        first_name = user_metadata.get('first_name', '')
        last_name = user_metadata.get('last_name', '')
        if full_name and not (first_name or last_name):
            parts = full_name.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''

        phone_number = user_metadata.get('phone_number') or payload.get('phone', '')
        avatar_url = user_metadata.get('avatar_url', '') or user_metadata.get('picture', '')

        with transaction.atomic():
            # 1. Search by supabase_uid
            user = User.objects.filter(supabase_uid=supabase_uid).first()

            # 2. Search by email if not found by supabase_uid
            if not user and email:
                user = User.objects.filter(email=email).first()
                if user:
                    user.supabase_uid = supabase_uid

            # 3. Create user if new
            if not user:
                # Ensure unique username
                base_username = email.split('@')[0] if email else str(supabase_uid)[:8]
                username = base_username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{counter}"
                    counter += 1

                user = User.objects.create(
                    supabase_uid=supabase_uid,
                    email=email,
                    username=username,
                    role=role,
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=phone_number,
                    avatar_url=avatar_url,
                    is_active=True,
                    is_verified=bool(payload.get('email_confirmed_at') or payload.get('confirmed_at'))
                )
                user.set_unusable_password()
                user.save()
            else:
                # Sync metadata changes idempotently
                updated = False
                if not user.supabase_uid:
                    user.supabase_uid = supabase_uid
                    updated = True
                if user_metadata.get('role') and user.role != role:
                    user.role = role
                    updated = True
                if first_name and user.first_name != first_name:
                    user.first_name = first_name
                    updated = True
                if last_name and user.last_name != last_name:
                    user.last_name = last_name
                    updated = True
                if phone_number and user.phone_number != phone_number:
                    user.phone_number = phone_number
                    updated = True
                if avatar_url and user.avatar_url != avatar_url:
                    user.avatar_url = avatar_url
                    updated = True
                if updated:
                    user.save()

            # 4. Sync CommuterProfile
            commuter_profile, _ = CommuterProfile.objects.get_or_create(user=user)
            if 'preferred_pickup_hub' in user_metadata:
                commuter_profile.preferred_pickup_hub = user_metadata['preferred_pickup_hub']
            if 'preferred_dropoff_hub' in user_metadata:
                commuter_profile.preferred_dropoff_hub = user_metadata['preferred_dropoff_hub']
            commuter_profile.save()

            # 5. Sync DriverProfile if role is Driver
            if role == CommuterRole.DRIVER:
                driver_profile, _ = DriverProfile.objects.get_or_create(user=user)
                if 'vehicle_make' in user_metadata:
                    driver_profile.vehicle_make = user_metadata['vehicle_make']
                if 'vehicle_model' in user_metadata:
                    driver_profile.vehicle_model = user_metadata['vehicle_model']
                if 'license_plate' in user_metadata:
                    driver_profile.license_plate = user_metadata['license_plate']
                if 'driver_license_number' in user_metadata:
                    driver_profile.driver_license_number = user_metadata['driver_license_number']
                driver_profile.save()

            # 6. Sync CorporateProfile if role is Corporate
            if role == CommuterRole.CORPORATE:
                corp_profile, _ = CorporateProfile.objects.get_or_create(user=user)
                if 'company_name' in user_metadata:
                    corp_profile.company_name = user_metadata['company_name']
                if 'corporate_domain' in user_metadata:
                    corp_profile.corporate_domain = user_metadata['corporate_domain']
                if 'employee_id' in user_metadata:
                    corp_profile.employee_id = user_metadata['employee_id']
                if 'department' in user_metadata:
                    corp_profile.department = user_metadata['department']
                corp_profile.save()

        return user

    def authenticate_header(self, request) -> str:
        return 'Bearer realm="api"'

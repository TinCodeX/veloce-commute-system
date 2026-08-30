import time
import uuid
import jwt
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from core.models import User, CommuterRole, CommuterProfile, DriverProfile, CorporateProfile

TEST_JWT_SECRET = "super-secret-test-supabase-jwt-key-32-chars-long"
TEST_SUPABASE_URL = "https://veloce-test.supabase.co"


@override_settings(
    SUPABASE_JWT_SECRET=TEST_JWT_SECRET,
    SUPABASE_URL=TEST_SUPABASE_URL,
    SUPABASE_AUDIENCE="authenticated"
)
class SupabaseAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_uuid = str(uuid.uuid4())
        self.email = "commuter.alex@veloce.io"

    def generate_token(self, sub=None, email=None, role="passenger", exp_offset=3600, secret=TEST_JWT_SECRET, aud="authenticated", iss=None, extra_metadata=None):
        payload = {
            "sub": sub or self.user_uuid,
            "email": email or self.email,
            "aud": aud,
            "iss": iss or f"{TEST_SUPABASE_URL}/auth/v1",
            "exp": int(time.time()) + exp_offset,
            "iat": int(time.time()),
            "user_metadata": {
                "role": role,
                "full_name": "Alex Mercer",
                "phone_number": "+1-555-0199",
                **(extra_metadata or {})
            }
        }
        return jwt.encode(payload, secret, algorithm="HS256")

    def test_health_check_public_access(self):
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')

    def test_unauthenticated_request_rejected(self):
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_valid_token_authenticates_and_provisions_passenger(self):
        token = self.generate_token(role="passenger")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['email'], self.email)
        self.assertEqual(response.data['user']['role'], 'passenger')
        self.assertEqual(response.data['user']['supabase_uid'], self.user_uuid)

        # Verify DB records
        user = User.objects.get(supabase_uid=self.user_uuid)
        self.assertEqual(user.email, self.email)
        self.assertEqual(user.first_name, 'Alex')
        self.assertEqual(user.last_name, 'Mercer')
        self.assertTrue(hasattr(user, 'commuter_profile'))

    def test_driver_role_provisions_driver_profile(self):
        driver_uuid = str(uuid.uuid4())
        driver_email = "driver.sarah@veloce.io"
        token = self.generate_token(
            sub=driver_uuid,
            email=driver_email,
            role="driver",
            extra_metadata={
                "vehicle_make": "Lucid",
                "vehicle_model": "Air Pure",
                "license_plate": "EV-9900",
                "driver_license_number": "DL-789012"
            }
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['role'], 'driver')
        self.assertIsNotNone(response.data['user']['driver_profile'])
        self.assertEqual(response.data['user']['driver_profile']['vehicle_make'], 'Lucid')

        # Test Driver-only endpoint
        manifest_res = self.client.get('/api/v1/driver/manifest/')
        self.assertEqual(manifest_res.status_code, status.HTTP_200_OK)
        self.assertEqual(manifest_res.data['driver'], driver_email)

    def test_corporate_role_provisions_corporate_profile(self):
        corp_uuid = str(uuid.uuid4())
        corp_email = "commuter@acme-corp.com"
        token = self.generate_token(
            sub=corp_uuid,
            email=corp_email,
            role="corporate",
            extra_metadata={
                "company_name": "Acme Innovations Inc",
                "corporate_domain": "acme-corp.com",
                "employee_id": "ACME-902",
                "department": "Infrastructure AI"
            }
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['role'], 'corporate')
        self.assertEqual(response.data['user']['corporate_profile']['company_name'], 'Acme Innovations Inc')

        # Test Corporate-only transit pass endpoint
        pass_res = self.client.get('/api/v1/corporate/transit-pass/')
        self.assertEqual(pass_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pass_res.data['corporate_account'], 'Acme Innovations Inc')

    def test_role_permission_denial(self):
        # A passenger should not be allowed to access driver manifest
        token = self.generate_token(role="passenger")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/v1/driver/manifest/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_expired_token_rejected(self):
        expired_token = self.generate_token(exp_offset=-100)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {expired_token}')

        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('expired', str(response.data))

    def test_invalid_signature_rejected(self):
        wrong_token = self.generate_token(secret="completely-wrong-secret-key-12345")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {wrong_token}')

        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_audience_rejected(self):
        wrong_aud_token = self.generate_token(aud="wrong-audience")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {wrong_aud_token}')

        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_patch_update(self):
        token = self.generate_token(role="passenger")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        patch_res = self.client.patch('/api/v1/commuter/profile/', {
            'phone_number': '+1-800-VELOCE-1',
            'preferred_pickup_hub': 'Bay Area South Terminal',
            'emergency_contact_name': 'Jordan Smith'
        }, format='json')

        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['user']['phone_number'], '+1-800-VELOCE-1')
        self.assertEqual(patch_res.data['user']['commuter_profile']['preferred_pickup_hub'], 'Bay Area South Terminal')

    def test_corridors_list_retrieval(self):
        token = self.generate_token(role="passenger")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.get('/api/v1/commuter/corridors/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(res.data['corridors']), 0)

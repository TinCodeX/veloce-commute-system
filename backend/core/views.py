from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from core.models import User, CommuteCorridor, CommuterRole
from core.serializers import UserSerializer, CommuteCorridorSerializer
from core.permissions import IsDriver, IsCorporateCommuter, IsPassenger


class HealthCheckView(APIView):
    """
    Public health check endpoint displaying service status and auth configuration state.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'Veloce Commute System Backend API',
            'version': '1.0.0',
            'supabase_auth_enabled': bool(getattr(settings, 'SUPABASE_JWT_SECRET', None) or getattr(settings, 'SUPABASE_URL', None)),
            'auth_mode': 'Symmetric (HS256) & Asymmetric JWKS (RS256/ES256)'
        })


class CommuterProfileView(APIView):
    """
    Sample protected endpoint: GET /api/v1/auth/me/ & /api/v1/commuter/profile/
    Returns verified user context and domain profile auto-provisioned from Supabase JWT.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            'success': True,
            'user': serializer.data,
            'auth_context': {
                'supabase_uid': str(request.user.supabase_uid),
                'role': request.user.role,
                'token_issuer': request.auth.get('iss') if isinstance(request.auth, dict) else None,
                'token_audience': request.auth.get('aud') if isinstance(request.auth, dict) else None,
            }
        })

    def patch(self, request):
        user = request.user
        data = request.data

        # Update User core fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        user.save()

        # Update commuter profile
        if hasattr(user, 'commuter_profile'):
            profile = user.commuter_profile
            if 'preferred_pickup_hub' in data:
                profile.preferred_pickup_hub = data['preferred_pickup_hub']
            if 'preferred_dropoff_hub' in data:
                profile.preferred_dropoff_hub = data['preferred_dropoff_hub']
            if 'preferred_commute_time' in data:
                profile.preferred_commute_time = data['preferred_commute_time']
            if 'emergency_contact_name' in data:
                profile.emergency_contact_name = data['emergency_contact_name']
            if 'emergency_contact_phone' in data:
                profile.emergency_contact_phone = data['emergency_contact_phone']
            profile.save()

        # Update driver profile if applicable
        if user.role == CommuterRole.DRIVER and hasattr(user, 'driver_profile'):
            d_profile = user.driver_profile
            for field in ['vehicle_make', 'vehicle_model', 'vehicle_color', 'license_plate', 'current_corridor']:
                if field in data:
                    setattr(d_profile, field, data[field])
            d_profile.save()

        # Update corporate profile if applicable
        if user.role == CommuterRole.CORPORATE and hasattr(user, 'corporate_profile'):
            c_profile = user.corporate_profile
            for field in ['company_name', 'department', 'employee_id']:
                if field in data:
                    setattr(c_profile, field, data[field])
            c_profile.save()

        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': serializer.data
        })


class CommuteCorridorListView(APIView):
    """
    List active spatiotemporal corridors for carpools and subscription routes.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Auto-seed sample corridors if empty
        if not CommuteCorridor.objects.exists():
            CommuteCorridor.objects.create(
                name="North Silicon Express Line",
                code="CORR-NORTH-01",
                origin_hub="North Suburbia Hub (Bayview Transit Center)",
                destination_hub="Downtown Tech Innovation District",
                distance_km=24.50,
                estimated_minutes=32,
                frequency_minutes=10,
                base_fare=9.50
            )
            CommuteCorridor.objects.create(
                name="West Corridor Tech Shuttle",
                code="CORR-WEST-02",
                origin_hub="West Lake Rapid Park & Ride",
                destination_hub="Metropolitan Financial Core",
                distance_km=18.20,
                estimated_minutes=25,
                frequency_minutes=15,
                base_fare=8.00
            )
            CommuteCorridor.objects.create(
                name="South Airport Aerospace Corridor",
                code="CORR-SOUTH-03",
                origin_hub="Aerospace Science Park",
                destination_hub="South Interchange Terminal",
                distance_km=31.00,
                estimated_minutes=38,
                frequency_minutes=20,
                base_fare=12.00
            )

        corridors = CommuteCorridor.objects.filter(is_active=True)
        serializer = CommuteCorridorSerializer(corridors, many=True)
        return Response({
            'count': corridors.count(),
            'role_view': request.user.role,
            'corridors': serializer.data
        })


class DriverManifestView(APIView):
    """
    Protected driver-only corridor passenger manifest and earnings summary.
    """
    permission_classes = [IsDriver]

    def get(self, request):
        driver_profile = getattr(request.user, 'driver_profile', None)
        return Response({
            'driver': request.user.email,
            'corridor': driver_profile.current_corridor if driver_profile else 'Express Corridor A-12',
            'active_passengers': [
                {'name': 'Marcus Vance', 'pickup': 'Stop 3 (Bayview)', 'seat': 1, 'status': 'BOARDED'},
                {'name': 'Sarah Lin', 'pickup': 'Stop 4 (Tech Hub North)', 'seat': 2, 'status': 'CONFIRMED'},
                {'name': 'David Kim', 'pickup': 'Stop 4 (Tech Hub North)', 'seat': 3, 'status': 'CONFIRMED'},
            ],
            'shift_status': 'ON_DUTY',
            'live_telemetry_ready': True
        })


class CorporateTransitPassView(APIView):
    """
    Protected B2B corporate employee pass and transit subsidy analytics.
    """
    permission_classes = [IsCorporateCommuter]

    def get(self, request):
        corp = getattr(request.user, 'corporate_profile', None)
        return Response({
            'corporate_account': corp.company_name if corp else 'Veloce Enterprise Partner',
            'employee': request.user.email,
            'monthly_subsidy': float(corp.monthly_transit_subsidy) if corp else 150.0,
            'used_this_month': float(corp.subsidy_used_this_month) if corp else 45.0,
            'carbon_offset_kg': 42.8,
            'eligible_routes': 'All Tier-1 Corporate Commuter Corridors'
        })

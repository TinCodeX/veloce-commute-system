from rest_framework import serializers
from core.models import User, CommuterProfile, DriverProfile, CorporateProfile, CommuteCorridor


class CommuterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommuterProfile
        fields = [
            'preferred_pickup_hub',
            'preferred_dropoff_hub',
            'preferred_commute_time',
            'wallet_balance',
            'subscription_status',
            'carbon_savings_kg',
            'emergency_contact_name',
            'emergency_contact_phone',
            'updated_at',
        ]


class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = [
            'vehicle_make',
            'vehicle_model',
            'vehicle_year',
            'vehicle_color',
            'license_plate',
            'seating_capacity',
            'driver_license_number',
            'is_driver_approved',
            'rating',
            'total_trips_completed',
            'earnings_balance',
            'current_corridor',
            'updated_at',
        ]


class CorporateProfileSerializer(serializers.ModelSerializer):
    remaining_subsidy = serializers.SerializerMethodField()

    class Meta:
        model = CorporateProfile
        fields = [
            'company_name',
            'corporate_domain',
            'employee_id',
            'department',
            'monthly_transit_subsidy',
            'subsidy_used_this_month',
            'remaining_subsidy',
            'is_corporate_verified',
            'updated_at',
        ]

    def get_remaining_subsidy(self, obj):
        return max(0.00, float(obj.monthly_transit_subsidy - obj.subsidy_used_this_month))


class UserSerializer(serializers.ModelSerializer):
    commuter_profile = CommuterProfileSerializer(read_only=True)
    driver_profile = DriverProfileSerializer(read_only=True)
    corporate_profile = CorporateProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'supabase_uid',
            'email',
            'username',
            'role',
            'first_name',
            'last_name',
            'phone_number',
            'avatar_url',
            'is_verified',
            'created_at',
            'updated_at',
            'commuter_profile',
            'driver_profile',
            'corporate_profile',
        ]
        read_only_fields = ['id', 'supabase_uid', 'created_at', 'updated_at']


class CommuteCorridorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommuteCorridor
        fields = [
            'id',
            'name',
            'code',
            'origin_hub',
            'destination_hub',
            'distance_km',
            'estimated_minutes',
            'frequency_minutes',
            'base_fare',
            'is_active',
        ]

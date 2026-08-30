import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class CommuterRole(models.TextChoices):
    PASSENGER = 'passenger', 'Passenger'
    DRIVER = 'driver', 'Driver'
    CORPORATE = 'corporate', 'Corporate Commuter'


class User(AbstractUser):
    """
    Custom user model for Project Veloce, mapped to Supabase Auth UUID (sub).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supabase_uid = models.UUIDField(unique=True, null=True, blank=True, db_index=True)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=CommuterRole.choices,
        default=CommuterRole.PASSENGER,
        db_index=True
    )
    phone_number = models.CharField(max_length=32, blank=True, default='')
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.role})"


class CommuterProfile(models.Model):
    """
    Core profile holding passenger commute preferences, digital transit wallet,
    and PostGIS-ready corridor subscription metadata.
    """
    class SubscriptionStatus(models.TextChoices):
        ACTIVE = 'active', 'Active Subscription'
        PAUSED = 'paused', 'Paused'
        INACTIVE = 'inactive', 'Inactive'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='commuter_profile')
    preferred_pickup_hub = models.CharField(max_length=150, blank=True, default='Central Station Transit Hub')
    preferred_dropoff_hub = models.CharField(max_length=150, blank=True, default='Tech Corridor West Gate')
    preferred_commute_time = models.CharField(max_length=50, blank=True, default='08:30 AM')
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    subscription_status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE
    )
    carbon_savings_kg = models.DecimalField(max_digits=8, decimal_places=2, default=14.50)
    emergency_contact_name = models.CharField(max_length=100, blank=True, default='')
    emergency_contact_phone = models.CharField(max_length=32, blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CommuterProfile({self.user.email}) - {self.subscription_status}"


class DriverProfile(models.Model):
    """
    Veloce Driver details for corridor assignment, vehicle compliance, and capacity.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    vehicle_make = models.CharField(max_length=60, default='Tesla')
    vehicle_model = models.CharField(max_length=60, default='Model Y')
    vehicle_year = models.PositiveIntegerField(default=2024)
    vehicle_color = models.CharField(max_length=30, default='Obsidian Black')
    license_plate = models.CharField(max_length=20, default='VEL-2049')
    seating_capacity = models.PositiveSmallIntegerField(default=4)
    driver_license_number = models.CharField(max_length=50, blank=True, default='DL-9843210')
    is_driver_approved = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.95)
    total_trips_completed = models.PositiveIntegerField(default=128)
    earnings_balance = models.DecimalField(max_digits=10, decimal_places=2, default=420.75)
    current_corridor = models.CharField(max_length=150, default='Express Corridor A-12 (North <-> South Tech Line)')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"DriverProfile({self.user.email}) - {self.vehicle_make} {self.vehicle_model}"


class CorporateProfile(models.Model):
    """
    Corporate B2B enterprise commuter pass, department routing, and employer subsidy.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='corporate_profile')
    company_name = models.CharField(max_length=150, default='Veloce Enterprise Corp')
    corporate_domain = models.CharField(max_length=100, default='veloce.global')
    employee_id = models.CharField(max_length=50, blank=True, default='EMP-7701')
    department = models.CharField(max_length=100, default='Engineering & Product')
    monthly_transit_subsidy = models.DecimalField(max_digits=8, decimal_places=2, default=150.00)
    subsidy_used_this_month = models.DecimalField(max_digits=8, decimal_places=2, default=45.00)
    is_corporate_verified = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CorporateProfile({self.user.email}) - {self.company_name}"


class CommuteCorridor(models.Model):
    """
    Spatiotemporal transit corridor definition preparing for PostGIS spatial queries.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, unique=True)
    origin_hub = models.CharField(max_length=150)
    destination_hub = models.CharField(max_length=150)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, default=18.5)
    estimated_minutes = models.PositiveIntegerField(default=28)
    frequency_minutes = models.PositiveIntegerField(default=15)
    base_fare = models.DecimalField(max_digits=6, decimal_places=2, default=8.50)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Corridor [{self.code}] {self.name}"

from django.urls import path
from core.views import (
    HealthCheckView,
    CommuterProfileView,
    CommuteCorridorListView,
    DriverManifestView,
    CorporateTransitPassView,
)

urlpatterns = [
    # Health & Diagnostics
    path('health/', HealthCheckView.as_view(), name='health-check'),

    # Profile & Identity Verification
    path('auth/me/', CommuterProfileView.as_view(), name='auth-me'),
    path('commuter/profile/', CommuterProfileView.as_view(), name='commuter-profile'),

    # Spatiotemporal Corridors & Subscriptions
    path('commuter/corridors/', CommuteCorridorListView.as_view(), name='commuter-corridors'),

    # Role-Guarded Special Endpoints
    path('driver/manifest/', DriverManifestView.as_view(), name='driver-manifest'),
    path('corporate/transit-pass/', CorporateTransitPassView.as_view(), name='corporate-transit-pass'),
]

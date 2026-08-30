from rest_framework.permissions import BasePermission
from core.models import CommuterRole


class IsCommuter(BasePermission):
    """
    Allows access only to authenticated commuters.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsPassenger(BasePermission):
    """
    Allows access only to passenger commuters.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == CommuterRole.PASSENGER
        )


class IsDriver(BasePermission):
    """
    Allows access only to verified drivers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == CommuterRole.DRIVER
        )


class IsCorporateCommuter(BasePermission):
    """
    Allows access only to B2B corporate commuters.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == CommuterRole.CORPORATE
        )

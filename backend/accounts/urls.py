# backend/accounts/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from .views import ShopViewSet, EmployeeViewSet, StationViewSet, CurrentUserView

router = DefaultRouter()
router.register(r"shops", ShopViewSet, basename="shop")
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"stations", StationViewSet, basename="station")

urlpatterns = [
    # JWT auth endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # Current user info
    path("me/", CurrentUserView.as_view(), name="current_user"),

    # Account-related resources
    path("", include(router.urls)),
]

# backend/accounts/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ShopViewSet, EmployeeViewSet, StationViewSet

router = DefaultRouter()
router.register(r"shops", ShopViewSet, basename="shop")
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"stations", StationViewSet, basename="station")

urlpatterns = [
    path("", include(router.urls)),
]

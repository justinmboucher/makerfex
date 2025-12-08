# backend/config/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ShopConfigViewSet, IntegrationConfigViewSet

router = DefaultRouter()
router.register(r"shop-configs", ShopConfigViewSet, basename="shopconfig")
router.register(r"integrations", IntegrationConfigViewSet, basename="integrationconfig")

urlpatterns = [
    path("", include(router.urls)),
]

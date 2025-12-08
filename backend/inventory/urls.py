# backend/inventory/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MaterialViewSet, ConsumableViewSet, EquipmentViewSet

router = DefaultRouter()
router.register(r"materials", MaterialViewSet, basename="material")
router.register(r"consumables", ConsumableViewSet, basename="consumable")
router.register(r"equipment", EquipmentViewSet, basename="equipment")

urlpatterns = [
    path("", include(router.urls)),
]

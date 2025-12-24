# backend/inventory/urls.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ConsumableViewSet,
    EquipmentViewSet,
    InventoryAdjustView,
    InventoryConsumeView,
    InventoryTransactionViewSet,
    MaterialViewSet,
)

router = DefaultRouter()
router.register(r"materials", MaterialViewSet, basename="material")
router.register(r"consumables", ConsumableViewSet, basename="consumable")
router.register(r"equipment", EquipmentViewSet, basename="equipment")
router.register(r"transactions", InventoryTransactionViewSet, basename="inventorytransaction")

urlpatterns = [
    path("", include(router.urls)),
    path("consume/", InventoryConsumeView.as_view(), name="inventory-consume"),
    path("adjust/", InventoryAdjustView.as_view(), name="inventory-adjust"),
]

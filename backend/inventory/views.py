# backend/inventory/views.py
from decimal import Decimal, InvalidOperation

from rest_framework import viewsets
from rest_framework.filters import OrderingFilter

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter

from .models import Material, Consumable, Equipment
from .serializers import MaterialSerializer, ConsumableSerializer, EquipmentSerializer


def _truthy(v: str | None) -> bool:
    if v is None:
        return False
    return v.strip().lower() in {"1", "true", "t", "yes", "y", "on"}


def _parse_bool(v: str | None) -> bool | None:
    if v is None:
        return None
    s = v.strip().lower()
    if s in {"1", "true", "t", "yes", "y", "on"}:
        return True
    if s in {"0", "false", "f", "no", "n", "off"}:
        return False
    return None


class InventoryBaseViewSet(viewsets.ModelViewSet):
    """
    Canonical server-driven table contract:
    - ?q= search (QueryParamSearchFilter)
    - ?ordering=
    - ?page= / ?page_size=
    Plus inventory-specific backend-authoritative filters:
    - ?is_active=0|1
    - ?low_stock=1  (reorder_point > 0 AND quantity_on_hand <= reorder_point)
    """

    filter_backends = [QueryParamSearchFilter, OrderingFilter]

    # Keep ordering explicit and predictable.
    ordering_fields = [
        "name",
        "sku",
        "quantity_on_hand",
        "reorder_point",
        "unit_cost",
        "is_active",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]

    # set in subclasses
    model = None

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return self.model.objects.none()

        qs = self.model.objects.filter(shop=shop)

        # Backend-authoritative filters
        qp = self.request.query_params

        is_active = _parse_bool(qp.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        if _truthy(qp.get("low_stock")):
            # reorder_point > 0 AND quantity_on_hand <= reorder_point
            qs = qs.filter(reorder_point__gt=0).filter(quantity_on_hand__lte=models.F("reorder_point"))

        # Optional future nicety (harmless to include now):
        # ?preferred_station=<id>
        pref_station = qp.get("preferred_station")
        if pref_station:
            try:
                qs = qs.filter(preferred_station_id=int(pref_station))
            except ValueError:
                pass

        return qs

    def perform_create(self, serializer):
        # Tenant safety: force shop assignment, ignore client-provided shop.
        shop = get_shop_for_user(self.request.user)
        serializer.save(shop=shop)


# NOTE: models.F needed; import kept local to avoid clutter above.
from django.db import models  # noqa: E402


class MaterialViewSet(InventoryBaseViewSet):
    model = Material
    queryset = Material.objects.all()  # required by DRF, but overridden by get_queryset
    serializer_class = MaterialSerializer
    search_fields = ["name", "sku", "description", "unit_of_measure", "material_type"]


class ConsumableViewSet(InventoryBaseViewSet):
    model = Consumable
    queryset = Consumable.objects.all()
    serializer_class = ConsumableSerializer
    search_fields = ["name", "sku", "description", "unit_of_measure", "consumable_type"]


class EquipmentViewSet(InventoryBaseViewSet):
    model = Equipment
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    search_fields = ["name", "sku", "description", "unit_of_measure", "serial_number"]

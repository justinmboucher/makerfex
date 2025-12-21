# backend/inventory/views.py
# ============================================================================
# Inventory ViewSets (Server-Driven Tables)
# ----------------------------------------------------------------------------
# Enforces canonical list contract:
# - ?q=        free-text search (QueryParamSearchFilter)
# - ?ordering= server-side ordering (asc/desc)
# - ?page= / ?page_size= pagination (DRF settings)
#
# Adds backend-authoritative filters for presets:
# - ?is_active=0|1
# - ?low_stock=1   (reorder_point > 0 AND quantity_on_hand <= reorder_point)
#
# Tenant safety:
# - Querysets are always scoped to request.user's shop via get_shop_for_user()
#
# Note:
# - Read-only viewsets for now (no destructive actions).
# ============================================================================

from decimal import Decimal
from typing import Optional

from django.db.models import F
from rest_framework import viewsets, status
from rest_framework.filters import OrderingFilter
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter
from accounts.models import Employee, Station
from projects.models import Project

from inventory.models import InventoryTransaction
from inventory.serializers import InventoryConsumeSerializer
from inventory.services import apply_inventory_transaction

from .models import Material, Consumable, Equipment
from .serializers import MaterialSerializer, ConsumableSerializer, EquipmentSerializer



def _parse_bool(v: Optional[str]) -> Optional[bool]:
    if v is None:
        return None
    s = v.strip().lower()
    if s in {"1", "true", "t", "yes", "y", "on"}:
        return True
    if s in {"0", "false", "f", "no", "n", "off"}:
        return False
    return None


def _truthy(v: Optional[str]) -> bool:
    return _parse_bool(v) is True


class InventoryBaseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Base viewset for inventory types with:
    - Tenant scoping
    - ?q= search
    - ?ordering=
    - Backend-authoritative filters for presets
    """

    filter_backends = [QueryParamSearchFilter, OrderingFilter]

    # Keep ordering explicit + stable
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

    # Subclasses must set:
    # - model
    # - serializer_class
    # - search_fields
    model = None

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return self.model.objects.none()

        qs = self.model.objects.filter(shop=shop)

        qp = self.request.query_params

        # Backend-authoritative filters
        is_active = _parse_bool(qp.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        if _truthy(qp.get("low_stock")):
            # reorder_point > 0 AND quantity_on_hand <= reorder_point
            qs = qs.filter(reorder_point__gt=Decimal("0")).filter(
                quantity_on_hand__lte=F("reorder_point")
            )

        # Optional: station filter (safe to support now; useful later)
        preferred_station = qp.get("preferred_station")
        if preferred_station:
            try:
                qs = qs.filter(preferred_station_id=int(preferred_station))
            except (TypeError, ValueError):
                pass

        return qs


class MaterialViewSet(InventoryBaseViewSet):
    model = Material
    queryset = Material.objects.all()  # DRF requires; tenant scoping in get_queryset
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


class InventoryConsumeView(APIView):
    """
    Record inventory consumption for a project.

    This creates an InventoryTransaction and eagerly updates
    quantity_on_hand via the inventory service layer.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        shop = get_shop_for_user(request.user)
        if not shop:
            return Response(
                {"detail": "Current user has no shop configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = InventoryConsumeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        employee = Employee.objects.filter(
            shop=shop, user=request.user
        ).first()

        project = None
        if "project_id" in data:
            project = get_object_or_404(
                Project,
                id=data["project_id"],
                shop=shop,
            )

        station = None
        if "station_id" in data:
            station = get_object_or_404(
                Station,
                id=data["station_id"],
                shop=shop,
            )

        txn = apply_inventory_transaction(
            shop=shop,
            inventory_type=data["inventory_type"],
            inventory_id=data["inventory_id"],
            quantity_delta=-data["quantity"],  # consumption = negative
            reason=InventoryTransaction.Reason.CONSUME,
            project=project,
            bom_snapshot_type=data.get("bom_snapshot_type"),
            bom_snapshot_id=data.get("bom_snapshot_id"),
            station=station,
            created_by=employee,
            notes=data.get("notes", ""),
        )

        return Response(
            {
                "id": txn.id,
                "inventory_type": txn.inventory_type,
                "quantity_delta": txn.quantity_delta,
                "reason": txn.reason,
                "created_at": txn.created_at,
            },
            status=status.HTTP_201_CREATED,
        )
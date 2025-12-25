# backend/inventory/views.py
# ============================================================================
# Inventory ViewSets + Ledger (Server-Driven Tables)
# ----------------------------------------------------------------------------
# Adds:
# - Consume endpoint supports BOM snapshot provenance validation.
# - Uses InventoryTransaction.Reason.CONSUME (not "consumption").
# ============================================================================

from typing import Optional

from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.dateparse import parse_date, parse_datetime
from datetime import datetime, time
from django.utils import timezone


from accounts.models import Employee
from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter, parse_bool
from makerfex_backend.mixins import ServerTableViewSetMixin, ShopScopedQuerysetMixin

from .models import Consumable, Equipment, InventoryTransaction, Material
from .serializers import (
    ConsumableSerializer,
    EquipmentSerializer,
    InventoryAdjustSerializer,
    InventoryConsumeSerializer,
    InventoryTransactionSerializer,
    MaterialSerializer,
)
from .services import apply_inventory_transaction


def _get_employee(shop, user) -> Optional[Employee]:
    if not shop:
        return None
    return Employee.objects.filter(shop=shop, user=user).first()


class InventoryBaseViewSet(ServerTableViewSetMixin, ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    ordering = ["name"]

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        if hasattr(obj, "is_active") and obj.is_active:
            obj.is_active = False
            obj.save(update_fields=["is_active"])

        data = self.get_serializer(obj).data
        return Response(
            {
                "detail": "Inventory item cannot be deleted; it was disabled instead.",
                "disabled": True,
                "item": data,
            },
            status=status.HTTP_200_OK,
        )


class MaterialViewSet(InventoryBaseViewSet):
    serializer_class = MaterialSerializer
    queryset = Material.objects.all()

    search_fields = ["name", "sku", "description"]
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

    def get_shop_queryset(self, shop):
        qs = Material.objects.filter(shop=shop)
        qp = self.request.query_params

        is_active = parse_bool(qp.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        low_stock = parse_bool(qp.get("low_stock"))
        if low_stock is True:
            # simple low-stock: <= reorder_point OR <= 0
            qs = qs.filter(quantity_on_hand__lte=0) | qs.filter(quantity_on_hand__lte=qs.values("reorder_point"))

        preferred_station = qp.get("preferred_station")
        if preferred_station:
            try:
                qs = qs.filter(preferred_station_id=int(preferred_station))
            except (TypeError, ValueError):
                pass

        return qs


class ConsumableViewSet(InventoryBaseViewSet):
    serializer_class = ConsumableSerializer
    queryset = Consumable.objects.all()

    search_fields = ["name", "sku", "description"]
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

    def get_shop_queryset(self, shop):
        qs = Consumable.objects.filter(shop=shop)
        qp = self.request.query_params

        is_active = parse_bool(qp.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        low_stock = parse_bool(qp.get("low_stock"))
        if low_stock is True:
            qs = qs.filter(quantity_on_hand__lte=0) | qs.filter(quantity_on_hand__lte=qs.values("reorder_point"))

        preferred_station = qp.get("preferred_station")
        if preferred_station:
            try:
                qs = qs.filter(preferred_station_id=int(preferred_station))
            except (TypeError, ValueError):
                pass

        return qs


class EquipmentViewSet(InventoryBaseViewSet):
    serializer_class = EquipmentSerializer
    queryset = Equipment.objects.all()

    search_fields = ["name", "sku", "description"]
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

    def get_shop_queryset(self, shop):
        qs = Equipment.objects.filter(shop=shop)
        qp = self.request.query_params

        is_active = parse_bool(qp.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        low_stock = parse_bool(qp.get("low_stock"))
        if low_stock is True:
            qs = qs.filter(quantity_on_hand__lte=0) | qs.filter(quantity_on_hand__lte=qs.values("reorder_point"))

        preferred_station = qp.get("preferred_station")
        if preferred_station:
            try:
                qs = qs.filter(preferred_station_id=int(preferred_station))
            except (TypeError, ValueError):
                pass

        return qs


class InventoryTransactionViewSet(ServerTableViewSetMixin, ShopScopedQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InventoryTransactionSerializer
    queryset = InventoryTransaction.objects.all()

    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "quantity_delta", "reason"]
    ordering = ["-created_at"]

    def get_shop_queryset(self, shop):
        qs = InventoryTransaction.objects.filter(shop=shop)
        qp = self.request.query_params

        inventory_type = qp.get("inventory_type")
        inventory_id = qp.get("inventory_id")

        if inventory_type:
            inv_type = inventory_type.lower()
            if inv_type in [
                InventoryTransaction.InventoryType.MATERIAL,
                InventoryTransaction.InventoryType.CONSUMABLE,
                InventoryTransaction.InventoryType.EQUIPMENT,
            ]:
                qs = qs.filter(inventory_type=inv_type)
                if inventory_id:
                    try:
                        iid = int(inventory_id)
                        if inv_type == InventoryTransaction.InventoryType.MATERIAL:
                            qs = qs.filter(material_id=iid)
                        elif inv_type == InventoryTransaction.InventoryType.CONSUMABLE:
                            qs = qs.filter(consumable_id=iid)
                        elif inv_type == InventoryTransaction.InventoryType.EQUIPMENT:
                            qs = qs.filter(equipment_id=iid)
                    except (TypeError, ValueError):
                        pass

        reason = qp.get("reason")
        if reason:
            qs = qs.filter(reason=reason)

        project = qp.get("project")
        if project:
            try:
                qs = qs.filter(project_id=int(project))
            except (TypeError, ValueError):
                pass

        station = qp.get("station")
        if station:
            try:
                qs = qs.filter(station_id=int(station))
            except (TypeError, ValueError):
                pass
        
        # Date filters (optional)
        created_after = qp.get("created_after")
        if created_after:
            # Accept YYYY-MM-DD (preferred) or ISO datetime
            d = parse_date(created_after)
            dt = parse_datetime(created_after) if d is None else None
            if d:
                # start of day in current tz
                start = datetime.combine(d, time.min)
                start = timezone.make_aware(start, timezone.get_current_timezone())
                qs = qs.filter(created_at__gte=start)
            elif dt:
                if timezone.is_naive(dt):
                    dt = timezone.make_aware(dt, timezone.get_current_timezone())
                qs = qs.filter(created_at__gte=dt)

        created_before = qp.get("created_before")
        if created_before:
            d = parse_date(created_before)
            dt = parse_datetime(created_before) if d is None else None
            if d:
                # end of day in current tz
                end = datetime.combine(d, time.max)
                end = timezone.make_aware(end, timezone.get_current_timezone())
                qs = qs.filter(created_at__lte=end)
            elif dt:
                if timezone.is_naive(dt):
                    dt = timezone.make_aware(dt, timezone.get_current_timezone())
                qs = qs.filter(created_at__lte=dt)

        return qs


class InventoryConsumeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Consume inventory (explicit mutation).
        Creates an InventoryTransaction and updates quantity_on_hand via apply_inventory_transaction().

        Supports optional BOM snapshot provenance:
          bom_snapshot_type + bom_snapshot_id (must match project + inventory item).
        """
        shop = get_shop_for_user(request.user)
        if not shop:
            raise ValidationError({"detail": "Current user has no shop configured."})

        ser = InventoryConsumeSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        inventory_type = data["inventory_type"]
        inventory_id = data["inventory_id"]
        quantity = data["quantity"]

        quantity_delta = -quantity

        project_id = data.get("project_id")
        station_id = data.get("station_id")
        notes = data.get("notes", "")

        bom_snapshot_type = data.get("bom_snapshot_type") or ""
        bom_snapshot_id = data.get("bom_snapshot_id")

        created_by = _get_employee(shop, request.user)

        # Resolve optional project/station models lazily to avoid circular deps
        project = None
        station = None

        if project_id:
            Project = __import__("projects.models", fromlist=["Project"]).Project
            project = Project.objects.filter(id=project_id, shop=shop).first()
            if not project:
                raise ValidationError({"project_id": "Invalid project."})

        if station_id:
            Station = __import__("accounts.models", fromlist=["Station"]).Station
            station = Station.objects.filter(id=station_id, shop=shop).first()
            if not station:
                raise ValidationError({"station_id": "Invalid station."})

        # Validate snapshot provenance if provided
        if bom_snapshot_type and bom_snapshot_id:
            if not project:
                raise ValidationError({"bom_snapshot": "project_id is required when using BOM snapshot provenance."})

            snap = None
            if bom_snapshot_type == InventoryTransaction.InventoryType.MATERIAL:
                Snap = __import__("projects.models", fromlist=["ProjectMaterialSnapshot"]).ProjectMaterialSnapshot
                snap = Snap.objects.filter(id=bom_snapshot_id, project_id=project.id).first()
                if not snap:
                    raise ValidationError({"bom_snapshot_id": "Invalid material snapshot for this project."})
                if snap.material_id and snap.material_id != inventory_id:
                    raise ValidationError({"inventory_id": "Inventory item does not match the selected snapshot."})

            elif bom_snapshot_type == InventoryTransaction.InventoryType.CONSUMABLE:
                Snap = __import__("projects.models", fromlist=["ProjectConsumableSnapshot"]).ProjectConsumableSnapshot
                snap = Snap.objects.filter(id=bom_snapshot_id, project_id=project.id).first()
                if not snap:
                    raise ValidationError({"bom_snapshot_id": "Invalid consumable snapshot for this project."})
                if snap.consumable_id and snap.consumable_id != inventory_id:
                    raise ValidationError({"inventory_id": "Inventory item does not match the selected snapshot."})

            elif bom_snapshot_type == InventoryTransaction.InventoryType.EQUIPMENT:
                Snap = __import__("projects.models", fromlist=["ProjectEquipmentSnapshot"]).ProjectEquipmentSnapshot
                snap = Snap.objects.filter(id=bom_snapshot_id, project_id=project.id).first()
                if not snap:
                    raise ValidationError({"bom_snapshot_id": "Invalid equipment snapshot for this project."})
                if snap.equipment_id and snap.equipment_id != inventory_id:
                    raise ValidationError({"inventory_id": "Inventory item does not match the selected snapshot."})

            else:
                raise ValidationError({"bom_snapshot_type": "Invalid bom_snapshot_type."})

        txn = apply_inventory_transaction(
            shop=shop,
            inventory_type=inventory_type,
            inventory_id=inventory_id,
            quantity_delta=quantity_delta,
            reason=InventoryTransaction.Reason.CONSUME,
            created_by=created_by,
            project=project,
            station=station,
            notes=notes,
            bom_snapshot_type=bom_snapshot_type,
            bom_snapshot_id=bom_snapshot_id,
        )

        out = InventoryTransactionSerializer(txn, context={"request": request}).data
        return Response({"detail": "Inventory consumed.", "transaction": out}, status=status.HTTP_200_OK)


class InventoryAdjustView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        shop = get_shop_for_user(request.user)
        if not shop:
            raise ValidationError({"detail": "Current user has no shop configured."})

        ser = InventoryAdjustSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        inventory_type = data["inventory_type"]
        inventory_id = data["inventory_id"]
        quantity_delta = data["quantity_delta"]
        reason = data.get("reason") or InventoryTransaction.Reason.ADJUSTMENT
        notes = data.get("notes", "")

        project_id = data.get("project_id")
        station_id = data.get("station_id")
        bom_snapshot_type = data.get("bom_snapshot_type") or ""
        bom_snapshot_id = data.get("bom_snapshot_id")

        created_by = _get_employee(shop, request.user)

        project = None
        station = None

        if project_id:
            Project = __import__("projects.models", fromlist=["Project"]).Project
            project = Project.objects.filter(id=project_id, shop=shop).first()
            if not project:
                raise ValidationError({"project_id": "Invalid project."})

        if station_id:
            Station = __import__("accounts.models", fromlist=["Station"]).Station
            station = Station.objects.filter(id=station_id, shop=shop).first()
            if not station:
                raise ValidationError({"station_id": "Invalid station."})

        txn = apply_inventory_transaction(
            shop=shop,
            inventory_type=inventory_type,
            inventory_id=inventory_id,
            quantity_delta=quantity_delta,
            reason=reason,
            created_by=created_by,
            project=project,
            station=station,
            notes=notes,
            bom_snapshot_type=bom_snapshot_type,
            bom_snapshot_id=bom_snapshot_id,
        )

        out = InventoryTransactionSerializer(txn, context={"request": request}).data
        return Response({"detail": "Inventory adjusted.", "transaction": out}, status=status.HTTP_200_OK)

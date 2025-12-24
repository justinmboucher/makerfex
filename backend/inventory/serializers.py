# backend/inventory/serializers.py

from rest_framework import serializers

from accounts.utils import get_shop_for_user
from .models import (
    Consumable,
    Equipment,
    InventoryTransaction,
    Material,
)


class _NoSilentQuantityMutationMixin:
    """
    Prevent direct edits to quantity_on_hand.
    Quantity changes must be performed via inventory transactions (ledger).
    """

    def validate(self, attrs):
        if self.instance and "quantity_on_hand" in attrs:
            raise serializers.ValidationError(
                {"quantity_on_hand": "Use inventory transactions to adjust quantity (no direct edits)."}
            )
        return attrs


class MaterialSerializer(_NoSilentQuantityMutationMixin, serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            "id",
            "shop",
            "image",
            "image_url",
            "name",
            "sku",
            "description",
            "unit_of_measure",
            "quantity_on_hand",
            "reorder_point",
            "unit_cost",
            "preferred_station",
            "material_type",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "shop", "quantity_on_hand", "created_at", "updated_at", "image_url"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class ConsumableSerializer(_NoSilentQuantityMutationMixin, serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Consumable
        fields = [
            "id",
            "shop",
            "image",
            "image_url",
            "name",
            "sku",
            "description",
            "unit_of_measure",
            "quantity_on_hand",
            "reorder_point",
            "unit_cost",
            "preferred_station",
            "consumable_type",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "shop", "quantity_on_hand", "created_at", "updated_at", "image_url"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class EquipmentSerializer(_NoSilentQuantityMutationMixin, serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = [
            "id",
            "shop",
            "image",
            "image_url",
            "name",
            "sku",
            "description",
            "quantity_on_hand",
            "reorder_point",
            "unit_cost",
            "preferred_station",
            "equipment_type",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "shop", "quantity_on_hand", "created_at", "updated_at", "image_url"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class InventoryTransactionSerializer(serializers.ModelSerializer):
    """
    Read-only ledger serializer.
    """

    class Meta:
        model = InventoryTransaction
        fields = [
            "id",
            "shop",
            "inventory_type",
            "material",
            "consumable",
            "equipment",
            "quantity_delta",
            "reason",
            "project",
            "station",
            "bom_snapshot_type",
            "bom_snapshot_id",
            "created_by",
            "notes",
            "created_at",
        ]
        read_only_fields = fields


class InventoryConsumeSerializer(serializers.Serializer):
    """
    Existing consume input contract (kept explicit).
    """
    inventory_type = serializers.ChoiceField(choices=InventoryTransaction.InventoryType.choices)
    inventory_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=3)
    project_id = serializers.IntegerField(required=False)
    station_id = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("quantity must be > 0.")
        return value


class InventoryAdjustSerializer(serializers.Serializer):
    """
    Explicit adjustment endpoint input.
    This is the "no silent mutations" path for stock corrections, waste, etc.
    """
    inventory_type = serializers.ChoiceField(choices=InventoryTransaction.InventoryType.choices)
    inventory_id = serializers.IntegerField()
    quantity_delta = serializers.DecimalField(max_digits=10, decimal_places=3)
    reason = serializers.ChoiceField(choices=InventoryTransaction.Reason.choices, required=False)
    project_id = serializers.IntegerField(required=False)
    station_id = serializers.IntegerField(required=False)
    bom_snapshot_type = serializers.CharField(required=False, allow_blank=True)
    bom_snapshot_id = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_quantity_delta(self, value):
        if value == 0:
            raise serializers.ValidationError("quantity_delta must be non-zero.")
        return value

    def validate(self, attrs):
        # (Optional) Ensure shop exists for the caller. Matches other domain patterns.
        request = self.context.get("request")
        shop = get_shop_for_user(request.user) if request else None
        if not shop:
            raise serializers.ValidationError({"detail": "Current user has no shop configured."})
        return attrs

# backend/inventory/serializers.py

from rest_framework import serializers

from accounts.utils import get_shop_for_user
from .models import Consumable, Equipment, InventoryTransaction, Material


class InventoryItemBaseSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
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
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "image_url"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def validate(self, attrs):
        # No silent mutations: quantity_on_hand cannot be patched directly.
        if self.instance and "quantity_on_hand" in attrs:
            raise serializers.ValidationError({"quantity_on_hand": "Use consume/adjust endpoints."})
        return attrs


class MaterialSerializer(InventoryItemBaseSerializer):
    class Meta(InventoryItemBaseSerializer.Meta):
        model = Material
        fields = InventoryItemBaseSerializer.Meta.fields + ["material_type"]


class ConsumableSerializer(InventoryItemBaseSerializer):
    class Meta(InventoryItemBaseSerializer.Meta):
        model = Consumable
        fields = InventoryItemBaseSerializer.Meta.fields + ["consumable_type"]


class EquipmentSerializer(InventoryItemBaseSerializer):
    class Meta(InventoryItemBaseSerializer.Meta):
        model = Equipment
        fields = InventoryItemBaseSerializer.Meta.fields + [
            "equipment_type"
            "serial_number",
            "purchase_date",
            "warranty_expiration",
        ]


class InventoryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryTransaction
        fields = [
            "id",
            "shop",
            "inventory_type",
            "material",
            "consumable",
            "equipment",
            "project",
            "bom_snapshot_type",
            "bom_snapshot_id",
            "quantity_delta",
            "reason",
            "station",
            "created_by",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class InventoryConsumeSerializer(serializers.Serializer):
    """
    Consume inventory (explicit mutation input).
    Supports optional BOM snapshot provenance for project execution logging.
    """

    inventory_type = serializers.ChoiceField(choices=InventoryTransaction.InventoryType.choices)
    inventory_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=3)

    project_id = serializers.IntegerField(required=False)
    station_id = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)

    # NEW: provenance
    bom_snapshot_type = serializers.ChoiceField(
        choices=InventoryTransaction.InventoryType.choices,
        required=False,
        allow_null=True,
    )
    bom_snapshot_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("quantity must be > 0.")
        return value

    def validate(self, attrs):
        # Optional: Ensure the user has a shop (tenant safety baseline)
        request = self.context.get("request")
        if request:
            shop = get_shop_for_user(request.user)
            if not shop:
                raise serializers.ValidationError({"detail": "Current user has no shop configured."})

        bst = attrs.get("bom_snapshot_type")
        bid = attrs.get("bom_snapshot_id")
        if (bst and not bid) or (bid and not bst):
            raise serializers.ValidationError(
                {"bom_snapshot": "bom_snapshot_type and bom_snapshot_id must be provided together."}
            )
        return attrs


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
        request = self.context.get("request")
        if request:
            shop = get_shop_for_user(request.user)
            if not shop:
                raise serializers.ValidationError({"detail": "Current user has no shop configured."})
        return attrs

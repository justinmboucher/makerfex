# backend/inventory/serializers.py
from rest_framework import serializers

from .models import Material, Consumable, Equipment


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = [
            "id",
            "shop",
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
        read_only_fields = ["id", "created_at", "updated_at"]


class ConsumableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consumable
        fields = [
            "id",
            "shop",
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
        read_only_fields = ["id", "created_at", "updated_at"]


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = [
            "id",
            "shop",
            "name",
            "sku",
            "description",
            "unit_of_measure",
            "quantity_on_hand",
            "reorder_point",
            "unit_cost",
            "preferred_station",
            "serial_number",
            "purchase_date",
            "warranty_expiration",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

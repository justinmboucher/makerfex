# backend/inventory/serializers.py
from rest_framework import serializers

from .models import Material, Consumable, Equipment
from inventory.models import InventoryTransaction


class MaterialSerializer(serializers.ModelSerializer):
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
    read_only_fields = ["id", "created_at", "updated_at", "image_url"]

  def get_image_url(self, obj):
    request = self.context.get("request")
    if obj.image and hasattr(obj.image, "url"):
      url = obj.image.url
      return request.build_absolute_uri(url) if request else url
    return None


class ConsumableSerializer(serializers.ModelSerializer):
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
    read_only_fields = ["id", "created_at", "updated_at", "image_url"]

  def get_image_url(self, obj):
    request = self.context.get("request")
    if obj.image and hasattr(obj.image, "url"):
      url = obj.image.url
      return request.build_absolute_uri(url) if request else url
    return None


class EquipmentSerializer(serializers.ModelSerializer):
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
    read_only_fields = ["id", "created_at", "updated_at", "image_url"]

  def get_image_url(self, obj):
    request = self.context.get("request")
    if obj.image and hasattr(obj.image, "url"):
      url = obj.image.url
      return request.build_absolute_uri(url) if request else url
    return None


class InventoryConsumeSerializer(serializers.Serializer):
    inventory_type = serializers.ChoiceField(
        choices=InventoryTransaction.InventoryType.choices
    )
    inventory_id = serializers.IntegerField()

    quantity = serializers.DecimalField(
        max_digits=10,
        decimal_places=3,
        help_text="Positive number; will be applied as a negative delta.",
    )

    project_id = serializers.IntegerField(required=False)
    bom_snapshot_type = serializers.CharField(required=False, allow_blank=True)
    bom_snapshot_id = serializers.IntegerField(required=False)

    station_id = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
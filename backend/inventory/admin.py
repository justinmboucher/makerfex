# backend/inventory/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import Material, Consumable, Equipment


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
  list_display = (
    "image_thumb",
    "name",
    "shop",
    "sku",
    "material_type",
    "quantity_on_hand",
    "unit_of_measure",
    "is_active",
  )
  list_filter = ("shop", "material_type", "is_active")
  search_fields = ("name", "sku", "description")
  autocomplete_fields = ("shop", "preferred_station")
  readonly_fields = ("image_thumb",)

  def image_thumb(self, obj):
    if obj.image and hasattr(obj.image, "url"):
      return format_html(
        '<img src="{}" style="height:32px;border-radius:4px;" />',
        obj.image.url,
      )
    return "—"

  image_thumb.short_description = "Image"


@admin.register(Consumable)
class ConsumableAdmin(admin.ModelAdmin):
  list_display = (
    "image_thumb",
    "name",
    "shop",
    "sku",
    "consumable_type",
    "quantity_on_hand",
    "unit_of_measure",
    "is_active",
  )
  list_filter = ("shop", "consumable_type", "is_active")
  search_fields = ("name", "sku", "description")
  autocomplete_fields = ("shop", "preferred_station")
  readonly_fields = ("image_thumb",)

  def image_thumb(self, obj):
    if obj.image and hasattr(obj.image, "url"):
      return format_html(
        '<img src="{}" style="height:32px;border-radius:4px;" />',
        obj.image.url,
      )
    return "—"

  image_thumb.short_description = "Image"


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
  list_display = (
    "image_thumb",
    "name",
    "shop",
    "sku",
    "serial_number",
    "purchase_date",
    "warranty_expiration",
    "is_active",
  )
  list_filter = ("shop", "is_active")
  search_fields = ("name", "sku", "serial_number", "description")
  autocomplete_fields = ("shop", "preferred_station")
  readonly_fields = ("image_thumb",)

  def image_thumb(self, obj):
    if obj.image and hasattr(obj.image, "url"):
      return format_html(
        '<img src="{}" style="height:32px;border-radius:4px;" />',
        obj.image.url,
      )
    return "—"

  image_thumb.short_description = "Image"

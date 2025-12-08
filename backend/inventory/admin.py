# backend/inventory/admin.py
from django.contrib import admin

from .models import Material, Consumable, Equipment


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "sku", "material_type", "quantity_on_hand", "unit_of_measure", "is_active")
    list_filter = ("shop", "material_type", "is_active")
    search_fields = ("name", "sku", "description")
    autocomplete_fields = ("shop", "preferred_station")


@admin.register(Consumable)
class ConsumableAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "sku", "consumable_type", "quantity_on_hand", "unit_of_measure", "is_active")
    list_filter = ("shop", "consumable_type", "is_active")
    search_fields = ("name", "sku", "description")
    autocomplete_fields = ("shop", "preferred_station")


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = (
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

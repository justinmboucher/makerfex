# backend/config/admin.py
from django.contrib import admin

from .models import ShopConfig, IntegrationConfig


@admin.register(ShopConfig)
class ShopConfigAdmin(admin.ModelAdmin):
    list_display = (
        "shop",
        "enable_inventory",
        "enable_analytics",
        "enable_time_tracking",
        "enable_assistants",
        "default_hourly_rate",
    )
    list_filter = (
        "enable_inventory",
        "enable_analytics",
        "enable_time_tracking",
        "enable_assistants",
    )
    search_fields = ("shop__name", "shop__slug")
    autocomplete_fields = ("shop",)


@admin.register(IntegrationConfig)
class IntegrationConfigAdmin(admin.ModelAdmin):
    list_display = ("shop", "provider", "name", "is_active")
    list_filter = ("shop", "provider", "is_active")
    search_fields = ("name",)
    autocomplete_fields = ("shop",)

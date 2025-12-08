# backend/products/admin.py
from django.contrib import admin

from .models import ProductTemplate, ProjectPromotion


@admin.register(ProductTemplate)
class ProductTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "slug", "base_price", "estimated_hours", "is_active")
    list_filter = ("shop", "is_active")
    search_fields = ("name", "slug", "description")
    autocomplete_fields = ("shop", "default_workflow")


@admin.register(ProjectPromotion)
class ProjectPromotionAdmin(admin.ModelAdmin):
    list_display = (
        "project",
        "channel",
        "status",
        "title",
        "link_url",
        "started_at",
        "ended_at",
    )
    list_filter = ("channel", "status")
    search_fields = ("title", "notes", "link_url")
    autocomplete_fields = ("project",)

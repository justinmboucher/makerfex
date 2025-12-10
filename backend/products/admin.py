# backend/products/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import ProductTemplate, ProjectPromotion


@admin.register(ProductTemplate)
class ProductTemplateAdmin(admin.ModelAdmin):
  list_display = ("photo_thumb", "name", "shop", "slug", "base_price", "estimated_hours", "is_active")
  list_filter = ("shop", "is_active")
  search_fields = ("name", "slug", "description")
  autocomplete_fields = ("shop", "default_workflow")
  readonly_fields = ("photo_thumb",)

  def photo_thumb(self, obj):
    if obj.photo and hasattr(obj.photo, "url"):
      return format_html(
        '<img src="{}" style="height:32px;border-radius:4px;" />',
        obj.photo.url,
      )
    return "—"

  photo_thumb.short_description = "Photo"


@admin.register(ProjectPromotion)
class ProjectPromotionAdmin(admin.ModelAdmin):
  list_display = (
    "image_thumb",
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
  readonly_fields = ("image_thumb",)

  def image_thumb(self, obj):
    if obj.image and hasattr(obj.image, "url"):
      return format_html(
        '<img src="{}" style="height:32px;border-radius:4px;" />',
        obj.image.url,
      )
    return "—"

  image_thumb.short_description = "Image"

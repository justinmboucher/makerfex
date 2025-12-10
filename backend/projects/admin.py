# backend/projects/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
  list_display = (
    "photo_thumb",
    "name",
    "shop",
    "customer",
    "status",
    "priority",
    "workflow",
    "current_stage",
    "due_date",
    "is_archived",
  )
  list_filter = (
    "shop",
    "status",
    "priority",
    "workflow",
    "current_stage",
    "is_archived",
  )
  search_fields = ("name", "reference_code", "description")
  autocomplete_fields = ("shop", "customer", "workflow", "current_stage", "created_by", "assigned_to")
  readonly_fields = ("photo_thumb",)

  def photo_thumb(self, obj):
    if obj.photo and hasattr(obj.photo, "url"):
      return format_html(
        '<img src="{}" style="height:32px;border-radius:4px;" />',
        obj.photo.url,
      )
    return "—"

  photo_thumb.short_description = "Photo"

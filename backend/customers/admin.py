# backend/customers/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
  list_display = (
    "photo_thumb",
    "first_name",
    "last_name",
    "shop",
    "email",
    "phone",
    "is_vip",
  )
  list_filter = ("shop", "is_vip", "country_code")
  search_fields = (
    "first_name",
    "last_name",
    "email",
    "phone",
    "company_name",
  )
  autocomplete_fields = ("shop",)
  readonly_fields = ("photo_thumb",)

  def photo_thumb(self, obj):
    if obj.photo and hasattr(obj.photo, "url"):
      return format_html(
        '<img src="{}" style="height:32px;border-radius:999px;" />',
        obj.photo.url,
      )
    return "—"

  photo_thumb.short_description = "Photo"

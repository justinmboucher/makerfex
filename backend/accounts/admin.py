# backend/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.html import format_html

from .models import User, Shop, Employee, Station


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
  """
  Standard Django User admin, wired to our custom User model.
  """
  pass


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
  list_display = ("name", "slug", "logo_thumb", "timezone", "currency_code", "is_active")
  list_filter = ("is_active", "timezone", "currency_code")
  search_fields = ("name", "slug", "legal_name", "email")

  readonly_fields = ("logo_thumb",)

  def logo_thumb(self, obj):
    if obj.logo and hasattr(obj.logo, "url"):
      return format_html(
        '<img src="{}" style="height:40px;border-radius:6px;" />',
        obj.logo.url,
      )
    return "—"

  logo_thumb.short_description = "Logo"


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
  list_display = (
    "first_name",
    "last_name",
    "shop",
    "role",
    "photo_thumb",
    "is_manager",
    "is_active",
  )
  list_filter = ("shop", "is_manager", "is_active")
  search_fields = ("first_name", "last_name", "email")
  autocomplete_fields = ("shop", "user")
  readonly_fields = ("photo_thumb",)

  def photo_thumb(self, obj):
    if obj.photo and hasattr(obj.photo, "url"):
      return format_html(
        '<img src="{}" style="height:36px;border-radius:999px;" />',
        obj.photo.url,
      )
    return "—"

  photo_thumb.short_description = "Photo"


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
  list_display = ("name", "shop", "code", "is_active")
  list_filter = ("shop", "is_active")
  search_fields = ("name", "code", "description")
  autocomplete_fields = ("shop", "employees")

# backend/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User, Shop, Employee, Station


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    """
    Standard Django User admin, wired to our custom User model.
    """
    pass


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "timezone", "currency_code", "is_active")
    list_filter = ("is_active", "timezone", "currency_code")
    search_fields = ("name", "slug", "legal_name", "email")


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "shop", "role", "is_manager", "is_active")
    list_filter = ("shop", "is_manager", "is_active")
    search_fields = ("first_name", "last_name", "email")
    autocomplete_fields = ("shop", "user")


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "code", "is_active")
    list_filter = ("shop", "is_active")
    search_fields = ("name", "code", "description")
    autocomplete_fields = ("shop", "employees")

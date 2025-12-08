# backend/customers/admin.py
from django.contrib import admin

from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
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

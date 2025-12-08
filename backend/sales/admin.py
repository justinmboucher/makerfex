# backend/sales/admin.py
from django.contrib import admin

from .models import SalesOrder, SalesOrderLine


class SalesOrderLineInline(admin.TabularInline):
    model = SalesOrderLine
    extra = 0
    autocomplete_fields = ("product_template", "project")


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "shop",
        "customer",
        "status",
        "source",
        "order_date",
        "total_amount",
    )
    list_filter = ("shop", "status", "source")
    search_fields = ("order_number", "notes")
    autocomplete_fields = ("shop", "customer", "project")
    inlines = [SalesOrderLineInline]


@admin.register(SalesOrderLine)
class SalesOrderLineAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "description",
        "quantity",
        "unit_price",
        "line_total",
        "product_template",
        "project",
    )
    list_filter = ("order",)
    search_fields = ("description",)
    autocomplete_fields = ("order", "product_template", "project")

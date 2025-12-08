# backend/projects/admin.py
from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
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
    autocomplete_fields = ("shop", "customer", "workflow", "current_stage",
                           "created_by", "assigned_to")

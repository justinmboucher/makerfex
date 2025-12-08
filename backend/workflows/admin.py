# backend/workflows/admin.py
from django.contrib import admin

from .models import Workflow, WorkflowStage


class WorkflowStageInline(admin.TabularInline):
    model = WorkflowStage
    extra = 1
    fields = (
        "name",
        "order",
        "is_initial",
        "is_final",
        "wip_limit",
        "is_active",
    )


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "is_default", "is_active", "created_by")
    list_filter = ("shop", "is_default", "is_active")
    search_fields = ("name", "description")
    autocomplete_fields = ("shop", "created_by")
    inlines = [WorkflowStageInline]


@admin.register(WorkflowStage)
class WorkflowStageAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "workflow",
        "order",
        "is_initial",
        "is_final",
        "wip_limit",
        "is_active",
    )
    list_filter = ("workflow", "is_initial", "is_final", "is_active")
    search_fields = ("name",)
    autocomplete_fields = ("workflow",)

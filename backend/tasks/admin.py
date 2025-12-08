# backend/tasks/admin.py
from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "project",
        "shop",
        "status",
        "stage",
        "station",
        "assignee",
        "due_date",
    )
    list_filter = (
        "shop",
        "status",
        "stage",
        "station",
        "assignee",
    )
    search_fields = ("title", "description")
    autocomplete_fields = ("shop", "project", "stage", "station", "assignee")

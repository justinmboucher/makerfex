# backend/assistants/admin.py
from django.contrib import admin

from .models import AssistantProfile, AssistantSession, AssistantMessage


@admin.register(AssistantProfile)
class AssistantProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "shop", "is_active", "default_model_name")
    list_filter = ("shop", "is_active")
    search_fields = ("name", "slug", "description")
    autocomplete_fields = ("shop",)


@admin.register(AssistantSession)
class AssistantSessionAdmin(admin.ModelAdmin):
    list_display = ("assistant", "shop", "created_by", "status", "last_activity_at")
    list_filter = ("shop", "assistant", "status")
    search_fields = ("title",)
    autocomplete_fields = ("shop", "assistant", "created_by")


@admin.register(AssistantMessage)
class AssistantMessageAdmin(admin.ModelAdmin):
    list_display = ("session", "role", "created_at")
    list_filter = ("role", "session")
    search_fields = ("content",)
    autocomplete_fields = ("session",)

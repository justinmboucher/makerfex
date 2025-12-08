# backend/assistants/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop, Employee


class AssistantProfile(TimeStampedModel):
    """
    Definition of an AI assistant persona.
    Can be global (no shop) or scoped to a specific shop.
    """
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="assistants",
        help_text="If null, this assistant is global / shared.",
    )

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=120)
    description = models.TextField(blank=True)

    role_prompt = models.TextField(
        blank=True,
        help_text="System/role instructions for this assistant.",
    )

    default_model_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional default LLM identifier (e.g. 'gpt-5.1').",
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["shop__slug", "name"]
        unique_together = ("shop", "slug")

    def __str__(self):
        scope = self.shop.slug if self.shop else "global"
        return f"{self.name} ({scope})"


class AssistantSession(TimeStampedModel):
    """
    A conversation/session with an assistant.
    """
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived"
        CLOSED = "closed", "Closed"

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="assistant_sessions",
    )
    assistant = models.ForeignKey(
        AssistantProfile,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    created_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assistant_sessions",
    )

    title = models.CharField(
        max_length=200,
        blank=True,
        help_text="Optional user-facing title for this session.",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    last_activity_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp of last message or interaction.",
    )

    metadata = models.JSONField(
        blank=True,
        null=True,
        help_text="Arbitrary session metadata (e.g. tags, context references).",
    )

    class Meta:
        ordering = ["-last_activity_at", "-created_at"]

    def __str__(self):
        return self.title or f"Session #{self.pk} with {self.assistant.name}"


class AssistantMessage(TimeStampedModel):
    """
    Individual message in an assistant session.
    """
    class Role(models.TextChoices):
        SYSTEM = "system", "System"
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"
        TOOL = "tool", "Tool"

    session = models.ForeignKey(
        AssistantSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
    )
    content = models.TextField()

    # Optional tool / function call metadata, request/response info, etc.
    metadata = models.JSONField(
        blank=True,
        null=True,
        help_text="Additional structured data (tool calls, tokens, etc.).",
    )

    class Meta:
        ordering = ["session", "created_at", "id"]

    def __str__(self):
        return f"{self.role} message in session {self.session_id}"

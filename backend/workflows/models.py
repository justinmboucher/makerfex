# backend/workflows/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop, Employee


class Workflow(TimeStampedModel):
    """
    A pipeline of stages that projects move through for a given shop.
    e.g. 'Standard Woodworking', 'Resin Casting', etc.
    """
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="workflows",
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    is_default = models.BooleanField(
        default=False,
        help_text="If true, this is the default workflow for new projects in this shop.",
    )
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_workflows",
    )

    class Meta:
        unique_together = ("shop", "name")
        ordering = ["shop", "name"]

    def __str__(self):
        return f"{self.name} ({self.shop.slug})"


class WorkflowStage(TimeStampedModel):
    """
    A single stage in a workflow (Kanban column).
    e.g. 'Design', 'Cutting', 'Assembly', 'Finishing', 'Ready to Ship'.
    """
    workflow = models.ForeignKey(
        Workflow,
        on_delete=models.CASCADE,
        related_name="stages",
    )
    name = models.CharField(max_length=150)
    order = models.PositiveIntegerField(
        default=0,
        help_text="Stage order within the workflow (lower = earlier).",
    )

    is_initial = models.BooleanField(
        default=False,
        help_text="If true, this can be used as a starting stage for new projects.",
    )
    is_final = models.BooleanField(
        default=False,
        help_text="If true, this represents a terminal stage (e.g. 'Completed').",
    )

    wip_limit = models.PositiveIntegerField(
        default=0,
        help_text="Optional WIP limit for this stage (0 = no limit).",
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("workflow", "name")
        ordering = ["workflow", "order", "id"]

    def __str__(self):
        return f"{self.name} [{self.workflow.name}]"

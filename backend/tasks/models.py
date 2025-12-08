# backend/tasks/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop, Employee, Station
from projects.models import Project
from workflows.models import WorkflowStage


class Task(TimeStampedModel):
    """
    A granular piece of work inside a project.
    Usually sits at a station, optionally assigned to an employee.
    """
    class Status(models.TextChoices):
        TODO = "todo", "To Do"
        IN_PROGRESS = "in_progress", "In Progress"
        BLOCKED = "blocked", "Blocked"
        DONE = "done", "Done"
        CANCELLED = "cancelled", "Cancelled"

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )

    stage = models.ForeignKey(
        WorkflowStage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks_in_stage",
        help_text="Optionally link a task to a workflow stage for finer-grained views.",
    )

    station = models.ForeignKey(
        Station,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )

    assignee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )

    order = models.PositiveIntegerField(
        default=0,
        help_text="Ordering field within a project (e.g. for task lists or boards).",
    )

    estimated_hours = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True,
    )
    actual_hours = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True,
    )

    due_date = models.DateField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["project", "order", "id"]

    def __str__(self):
        return f"{self.title} ({self.project.name})"

# backend/projects/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop, Employee
from customers.models import Customer
from workflows.models import Workflow, WorkflowStage


def project_photo_upload_path(instance: "Project", filename: str) -> str:
  return f"shops/{instance.shop_id or 'new'}/projects/{instance.id or 'new'}/{filename}"


class Project(TimeStampedModel):
  """
  A concrete project/job for a shop.
  Tied to a customer and moves through a workflow's stages.
  """

  class Priority(models.TextChoices):
    LOW = "low", "Low"
    NORMAL = "normal", "Normal"
    HIGH = "high", "High"
    RUSH = "rush", "Rush"

  class Status(models.TextChoices):
    ACTIVE = "active", "Active"
    ON_HOLD = "on_hold", "On Hold"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"

  shop = models.ForeignKey(
    Shop,
    on_delete=models.CASCADE,
    related_name="projects",
  )
  customer = models.ForeignKey(
    Customer,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="projects",
  )

  # NEW: optional project photo/hero image
  photo = models.ImageField(
    upload_to=project_photo_upload_path,
    blank=True,
    null=True,
    help_text="Optional photo of the project.",
  )

  name = models.CharField(max_length=200)
  reference_code = models.CharField(
    max_length=50,
    blank=True,
    help_text="Optional short code used internally or on tickets/invoices.",
  )
  description = models.TextField(blank=True)

  workflow = models.ForeignKey(
    Workflow,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="projects",
  )
  current_stage = models.ForeignKey(
    WorkflowStage,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="projects_in_stage",
  )

  priority = models.CharField(
    max_length=10,
    choices=Priority.choices,
    default=Priority.NORMAL,
  )
  status = models.CharField(
    max_length=20,
    choices=Status.choices,
    default=Status.ACTIVE,
  )

  start_date = models.DateField(null=True, blank=True)
  due_date = models.DateField(null=True, blank=True)
  completed_at = models.DateTimeField(null=True, blank=True)

  created_by = models.ForeignKey(
    Employee,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="created_projects",
  )
  assigned_to = models.ForeignKey(
    Employee,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="assigned_projects",
  )

  estimated_hours = models.DecimalField(
    max_digits=7,
    decimal_places=2,
    null=True,
    blank=True,
    help_text="Optional initial estimate of total project hours.",
  )
  actual_hours = models.DecimalField(
    max_digits=7,
    decimal_places=2,
    null=True,
    blank=True,
    help_text="Aggregated tracked hours (to be populated later by time tracking).",
  )

  is_archived = models.BooleanField(default=False)

  class Meta:
    ordering = ["shop", "-created_at"]

  def __str__(self):
    return f"{self.name} ({self.shop.slug})"

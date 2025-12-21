from django.db import models

from accounts.models import TimeStampedModel, Shop, Employee, Station
from customers.models import Customer
from workflows.models import Workflow, WorkflowStage


def project_photo_upload_path(instance: "Project", filename: str) -> str:
    return f"shops/{instance.shop_id or 'new'}/projects/{instance.id or 'new'}/{filename}"


class Project(TimeStampedModel):
    """
    A concrete project/job for a shop.
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

    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="projects")
    customer = models.ForeignKey(
        Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )

    product_template = models.ForeignKey(
        "products.ProductTemplate",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )

    photo = models.ImageField(upload_to=project_photo_upload_path, null=True, blank=True)
    name = models.CharField(max_length=200)
    reference_code = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)

    workflow = models.ForeignKey(
        Workflow, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )
    current_stage = models.ForeignKey(
        WorkflowStage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects_in_stage",
    )

    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.NORMAL
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )

    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    created_by = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_projects"
    )
    assigned_to = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_projects"
    )

    estimated_hours = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)

    station = models.ForeignKey(
        Station, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )

    is_archived = models.BooleanField(default=False)

    class Meta:
        ordering = ["shop", "-created_at"]


# ---------------------------------------------------------------------
# Project BOM Snapshots (IMMUTABLE)
# ---------------------------------------------------------------------

class ProjectMaterialSnapshot(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="material_snapshots")
    source_template = models.ForeignKey(
        "products.ProductTemplate", on_delete=models.SET_NULL, null=True, blank=True
    )
    material = models.ForeignKey(
        "inventory.Material", on_delete=models.SET_NULL, null=True, blank=True
    )
    material_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=50)
    unit_cost_snapshot = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)


class ProjectConsumableSnapshot(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="consumable_snapshots")
    source_template = models.ForeignKey(
        "products.ProductTemplate", on_delete=models.SET_NULL, null=True, blank=True
    )
    consumable = models.ForeignKey(
        "inventory.Consumable", on_delete=models.SET_NULL, null=True, blank=True
    )
    consumable_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=50)
    unit_cost_snapshot = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)


class ProjectEquipmentSnapshot(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="equipment_snapshots")
    source_template = models.ForeignKey(
        "products.ProductTemplate", on_delete=models.SET_NULL, null=True, blank=True
    )
    equipment = models.ForeignKey(
        "inventory.Equipment", on_delete=models.SET_NULL, null=True, blank=True
    )
    equipment_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=50)
    unit_cost_snapshot = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)

from django.db import models

from accounts.models import TimeStampedModel, Shop
from workflows.models import Workflow


def product_template_photo_upload_path(instance: "ProductTemplate", filename: str) -> str:
    return (
        f"shops/{instance.shop_id or 'new'}/products/templates/"
        f"{instance.id or 'new'}/{filename}"
    )


def promotion_image_upload_path(instance: "ProjectPromotion", filename: str) -> str:
    return f"projects/{instance.project_id or 'new'}/promotions/{instance.id or 'new'}/{filename}"


class ProductTemplate(TimeStampedModel):
    """
    A reusable blueprint for a kind of project/product.
    """

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="product_templates",
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120)
    description = models.TextField(blank=True)

    photo = models.ImageField(
        upload_to=product_template_photo_upload_path,
        blank=True,
        null=True,
        help_text="Optional product template photo.",
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    estimated_hours = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True,
    )

    default_workflow = models.ForeignKey(
        Workflow,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="product_templates",
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("shop", "slug")
        ordering = ["shop", "name"]

    def __str__(self):
        return f"{self.name} ({self.shop.slug})"


class ProjectPromotion(TimeStampedModel):
    """
    Promotion/listing of a specific project instance on a channel.
    """

    class Channel(models.TextChoices):
        ETSY = "etsy", "Etsy"
        WEBSITE = "website", "Website"
        INSTAGRAM = "instagram", "Instagram"
        FACEBOOK = "facebook", "Facebook"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        ACTIVE = "active", "Active"
        ENDED = "ended", "Ended"
        CANCELLED = "cancelled", "Cancelled"

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="promotions",
    )

    image = models.ImageField(
        upload_to=promotion_image_upload_path,
        blank=True,
        null=True,
    )

    channel = models.CharField(
        max_length=20,
        choices=Channel.choices,
        default=Channel.ETSY,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED,
    )

    title = models.CharField(max_length=200, blank=True)
    link_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]


# ---------------------------------------------------------------------
# Template BOM Requirements (RELATIONAL, NO IMPORT CYCLES)
# ---------------------------------------------------------------------

class ProductTemplateMaterialRequirement(TimeStampedModel):
    template = models.ForeignKey(
        ProductTemplate,
        on_delete=models.CASCADE,
        related_name="material_requirements",
    )
    material = models.ForeignKey(
        "inventory.Material",
        on_delete=models.PROTECT,
        related_name="template_requirements",
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=50)
    notes = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class ProductTemplateConsumableRequirement(TimeStampedModel):
    template = models.ForeignKey(
        ProductTemplate,
        on_delete=models.CASCADE,
        related_name="consumable_requirements",
    )
    consumable = models.ForeignKey(
        "inventory.Consumable",
        on_delete=models.PROTECT,
        related_name="template_requirements",
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=50)
    notes = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class ProductTemplateEquipmentRequirement(TimeStampedModel):
    template = models.ForeignKey(
        ProductTemplate,
        on_delete=models.CASCADE,
        related_name="equipment_requirements",
    )
    equipment = models.ForeignKey(
        "inventory.Equipment",
        on_delete=models.PROTECT,
        related_name="template_requirements",
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=50)
    notes = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

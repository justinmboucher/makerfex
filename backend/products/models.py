# backend/products/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop
from workflows.models import Workflow


class ProductTemplate(TimeStampedModel):
    """
    A reusable blueprint for a kind of project/product.
    e.g. 'Walnut Coffee Table', 'Charcuterie Board', etc.
    """
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="product_templates",
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120)
    description = models.TextField(blank=True)

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Base price before tax/fees.",
    )
    estimated_hours = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Default estimated hours for this template.",
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
    e.g. Etsy listing, website product page, Instagram promo, etc.
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

    # Use string reference to avoid circular imports at import time
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="promotions",
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

    title = models.CharField(
        max_length=200,
        blank=True,
        help_text="Optional per-promo title (e.g. Etsy listing title).",
    )
    link_url = models.URLField(
        blank=True,
        help_text="URL of the listing/post.",
    )

    notes = models.TextField(blank=True)

    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_channel_display()} promotion for {self.project}"
# backend/products/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop
from workflows.models import Workflow


def product_template_photo_upload_path(instance: "ProductTemplate", filename: str) -> str:
  return f"shops/{instance.shop_id or 'new'}/products/templates/{instance.id or 'new'}/{filename}"


def promotion_image_upload_path(instance: "ProjectPromotion", filename: str) -> str:
  return f"projects/{instance.project_id or 'new'}/promotions/{instance.id or 'new'}/{filename}"


class ProductTemplate(TimeStampedModel):
  """
  A reusable blueprint for a kind of project/product.
  e.g. 'Walnut Coffee Table', 'Charcuterie Board', etc.
  """

  shop = models.ForeignKey(
    Shop,
    on_delete=models.CASCADE,
    related_name="product_templates",
  )
  name = models.CharField(max_length=200)
  slug = models.SlugField(max_length=120)

  description = models.TextField(blank=True)

  # NEW: image/photo representing this template/product
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
    help_text="Base price before tax/fees.",
  )
  estimated_hours = models.DecimalField(
    max_digits=7,
    decimal_places=2,
    null=True,
    blank=True,
    help_text="Default estimated hours for this template.",
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
  e.g. Etsy listing, website product page, Instagram promo, etc.
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

  # Use string reference to avoid circular imports at import time
  project = models.ForeignKey(
    "projects.Project",
    on_delete=models.CASCADE,
    related_name="promotions",
  )

  # NEW: optional image used in promotions
  image = models.ImageField(
    upload_to=promotion_image_upload_path,
    blank=True,
    null=True,
    help_text="Optional promo image or thumbnail.",
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

  title = models.CharField(
    max_length=200,
    blank=True,
    help_text="Optional per-promo title (e.g. Etsy listing title).",
  )
  link_url = models.URLField(
    blank=True,
    help_text="URL of the listing/post.",
  )
  notes = models.TextField(blank=True)
  started_at = models.DateTimeField(null=True, blank=True)
  ended_at = models.DateTimeField(null=True, blank=True)

  class Meta:
    ordering = ["-created_at"]

  def __str__(self):
    return f"{self.get_channel_display()} promotion for {self.project}"

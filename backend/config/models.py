# backend/config/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop


class ShopConfig(TimeStampedModel):
    """
    Per-shop configuration flags and preferences.
    Things that don't fit cleanly on the core Shop model.
    """
    shop = models.OneToOneField(
        Shop,
        on_delete=models.CASCADE,
        related_name="config",
    )

    # Feature toggles
    enable_inventory = models.BooleanField(default=True)
    enable_analytics = models.BooleanField(default=True)
    enable_time_tracking = models.BooleanField(default=True)
    enable_assistants = models.BooleanField(default=True)

    # Defaults
    default_hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Default hourly rate for time-based cost calculations.",
    )
    default_project_priority = models.CharField(
        max_length=20,
        blank=True,
        help_text="Optional default priority label (e.g. 'normal', 'rush').",
    )

    # Working hours / preferences
    working_hours = models.JSONField(
        blank=True,
        null=True,
        help_text="Optional structured working hours config per weekday.",
    )
    locale = models.CharField(
        max_length=20,
        blank=True,
        help_text="Optional locale (e.g. 'en-US') for formatting.",
    )

    class Meta:
        verbose_name = "Shop configuration"
        verbose_name_plural = "Shop configurations"

    def __str__(self):
        return f"Config for {self.shop.slug}"


class IntegrationConfig(TimeStampedModel):
    """
    Configuration for external integrations like Etsy, Stripe, website, etc.
    """
    class Provider(models.TextChoices):
        ETSY = "etsy", "Etsy"
        SHOPIFY = "shopify", "Shopify"
        SQUARE = "square", "Square"
        STRIPE = "stripe", "Stripe"
        WEBSITE = "website", "Website"
        OTHER = "other", "Other"

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="integrations",
    )

    provider = models.CharField(
        max_length=50,
        choices=Provider.choices,
        default=Provider.OTHER,
    )
    name = models.CharField(
        max_length=150,
        help_text="Short label for this integration (e.g. 'Main Etsy shop').",
    )

    is_active = models.BooleanField(default=True)

    credentials = models.JSONField(
        blank=True,
        null=True,
        help_text="Secure-ish storage for tokens/keys (later move to vault or env).",
    )
    settings = models.JSONField(
        blank=True,
        null=True,
        help_text="Provider-specific options (e.g. shop IDs, sync settings).",
    )

    class Meta:
        ordering = ["shop", "provider", "name"]
        unique_together = ("shop", "provider", "name")

    def __str__(self):
        return f"{self.get_provider_display()} - {self.name} ({self.shop.slug})"

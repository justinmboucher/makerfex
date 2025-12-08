# backend/customers/models.py
from django.db import models

from accounts.models import Shop, TimeStampedModel


class Customer(TimeStampedModel):
    """
    End-customer for a shop (Etsy buyers, local clients, etc.).
    """
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="customers",
    )

    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)

    company_name = models.CharField(max_length=150, blank=True)

    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    region = models.CharField(
        max_length=100,
        blank=True,
        help_text="State / province / region.",
    )
    postal_code = models.CharField(max_length=20, blank=True)
    country_code = models.CharField(
        max_length=2,
        blank=True,
        help_text="ISO 3166-1 alpha-2 country code (e.g. 'US').",
    )

    is_vip = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    source = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional source label (e.g. 'Etsy', 'Website', 'Local fair').",
    )

    class Meta:
        ordering = ["shop", "first_name", "last_name"]

    def __str__(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return f"{name} ({self.shop.slug})"

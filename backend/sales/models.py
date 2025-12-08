# backend/sales/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop
from customers.models import Customer


class SalesOrder(TimeStampedModel):
    """
    A sales order / invoice representing a sale to a customer.
    Can be linked to a project (commission) or be product-only.
    """
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        OPEN = "open", "Open"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    class Source(models.TextChoices):
        ETSY = "etsy", "Etsy"
        WEBSITE = "website", "Website"
        POS = "pos", "Point of Sale"
        OTHER = "other", "Other"

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="sales_orders",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_orders",
    )

    # Use string for cross-app FK
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_orders",
    )

    order_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Human-readable order/invoice number.",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    source = models.CharField(
        max_length=20,
        choices=Source.choices,
        default=Source.OTHER,
    )

    order_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    currency_code = models.CharField(max_length=3, default="USD")

    subtotal_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-order_date", "-created_at"]

    def __str__(self):
        return self.order_number or f"Order #{self.pk} ({self.shop.slug})"


class SalesOrderLine(TimeStampedModel):
    """
    Line item on a sales order.
    Tied to a product template and/or project where applicable.
    """

    order = models.ForeignKey(
        SalesOrder,
        on_delete=models.CASCADE,
        related_name="lines",
    )

    product_template = models.ForeignKey(
        "products.ProductTemplate",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_lines",
    )

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_lines",
    )

    description = models.CharField(
        max_length=255,
        help_text="Description shown on invoice/receipt.",
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    line_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Optional cached line total (qty * unit_price).",
    )

    class Meta:
        ordering = ["order", "created_at"]

    def __str__(self):
        return f"{self.description} (Order {self.order_id})"

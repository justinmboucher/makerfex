# backend/inventory/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop, Station


def inventory_image_upload_path(instance: "InventoryItemBase", filename: str) -> str:
  model_name = instance.__class__.__name__.lower()
  return f"shops/{instance.shop_id or 'new'}/inventory/{model_name}/{instance.id or 'new'}/{filename}"


class InventoryItemBase(TimeStampedModel):
  """
  Common base for all inventory items.
  """

  shop = models.ForeignKey(
    Shop,
    on_delete=models.CASCADE,
    related_name="%(class)ss",
  )

  # NEW: optional image shared by all inventory types
  image = models.ImageField(
    upload_to=inventory_image_upload_path,
    blank=True,
    null=True,
    help_text="Optional image or thumbnail for this inventory item.",
  )

  name = models.CharField(max_length=200)
  sku = models.CharField(
    max_length=100,
    blank=True,
    help_text="Optional internal or vendor SKU.",
  )
  description = models.TextField(blank=True)

  unit_of_measure = models.CharField(
    max_length=50,
    blank=True,
    help_text="e.g. 'board ft', 'ml', 'pcs'.",
  )
  quantity_on_hand = models.DecimalField(
    max_digits=10,
    decimal_places=3,
    default=0,
    help_text="Current quantity on hand.",
  )
  reorder_point = models.DecimalField(
    max_digits=10,
    decimal_places=3,
    default=0,
    help_text="Reorder threshold. 0 = no threshold.",
  )
  unit_cost = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    null=True,
    blank=True,
    help_text="Last known unit cost.",
  )

  preferred_station = models.ForeignKey(
    Station,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="%(class)ss",
    help_text="Optional primary station where this item is used.",
  )

  is_active = models.BooleanField(default=True)

  class Meta:
    abstract = True

  def __str__(self):
    return f"{self.name} ({self.shop.slug})"


class Material(InventoryItemBase):
  """
  Primary materials that become part of the finished piece.
  e.g. hardwood boards, sheet goods, resin.
  """

  material_type = models.CharField(
    max_length=100,
    blank=True,
    help_text="Optional material type label (e.g. 'Hardwood', 'Plywood', 'Resin').",
  )

  class Meta:
    ordering = ["shop", "name"]


class Consumable(InventoryItemBase):
  """
  Consumables used in the process. e.g. sandpaper, glue, finish.
  """

  consumable_type = models.CharField(
    max_length=100,
    blank=True,
    help_text="Optional consumable type label (e.g. 'Abrasive', 'Adhesive').",
  )

  class Meta:
    ordering = ["shop", "name"]


class Equipment(InventoryItemBase):
  """
  Equipment/tools that are maintained and tracked.
  e.g. table saw, CNC, bandsaw, spray system.
  """

  serial_number = models.CharField(max_length=100, blank=True)
  purchase_date = models.DateField(null=True, blank=True)
  warranty_expiration = models.DateField(null=True, blank=True)

  class Meta:
    ordering = ["shop", "name"]

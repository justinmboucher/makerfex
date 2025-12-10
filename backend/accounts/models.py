# backend/accounts/models.py
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class TimeStampedModel(models.Model):
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    abstract = True


class User(AbstractUser):
  """
  Custom user model (hooked via AUTH_USER_MODEL).
  Add extra auth-related fields here later if needed.
  """

  # Example: you could add a "display_name" later
  # display_name = models.CharField(max_length=150, blank=True)

  def __str__(self):
    return self.get_username()


def shop_logo_upload_path(instance: "Shop", filename: str) -> str:
  return f"shops/{instance.id or 'new'}/logos/{filename}"


def employee_photo_upload_path(instance: "Employee", filename: str) -> str:
  return f"shops/{instance.shop_id or 'new'}/employees/{instance.id or 'new'}/{filename}"


class Shop(TimeStampedModel):
  """
  A single maker business / workshop.
  """

  name = models.CharField(max_length=150)
  slug = models.SlugField(max_length=100, unique=True)
  legal_name = models.CharField(max_length=255, blank=True)

  email = models.EmailField(blank=True)
  phone = models.CharField(max_length=50, blank=True)
  website = models.URLField(blank=True)

  timezone = models.CharField(max_length=64, default="UTC")
  currency_code = models.CharField(max_length=3, default="USD")

  # NEW: logo for branding in UI
  logo = models.ImageField(
    upload_to=shop_logo_upload_path,
    blank=True,
    null=True,
    help_text="Logo image for this shop (used in UI).",
  )

  is_active = models.BooleanField(default=True)

  class Meta:
    ordering = ["name"]

  def __str__(self):
    return self.name


class Employee(TimeStampedModel):
  """
  Person working at a shop.
  Optionally linked to a login account (User).
  """

  shop = models.ForeignKey(
    Shop,
    on_delete=models.CASCADE,
    related_name="employees",
  )
  user = models.OneToOneField(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="employee",
  )

  first_name = models.CharField(max_length=80)
  last_name = models.CharField(max_length=80, blank=True)
  email = models.EmailField(blank=True)
  role = models.CharField(
    max_length=80,
    blank=True,
    help_text="Short role label (e.g. 'Owner', 'CNC Operator').",
  )

  # NEW: employee profile photo
  photo = models.ImageField(
    upload_to=employee_photo_upload_path,
    blank=True,
    null=True,
    help_text="Optional profile photo for the employee.",
  )

  is_manager = models.BooleanField(default=False)
  is_active = models.BooleanField(default=True)

  class Meta:
    ordering = ["shop", "first_name", "last_name"]

  def __str__(self):
    full_name = f"{self.first_name} {self.last_name}".strip()
    return f"{full_name} @ {self.shop.name}"


class Station(TimeStampedModel):
  """
  Physical or logical work station in the shop.
  e.g. 'Table Saw', 'Finishing', 'CNC 1'.
  """

  shop = models.ForeignKey(
    Shop,
    on_delete=models.CASCADE,
    related_name="stations",
  )
  name = models.CharField(max_length=150)
  code = models.CharField(
    max_length=50,
    blank=True,
    help_text="Optional short code (e.g. 'CNC-1', 'FIN-01').",
  )
  description = models.TextField(blank=True)

  is_active = models.BooleanField(default=True)
  employees = models.ManyToManyField(
    "Employee",
    related_name="stations",
    blank=True,
  )

  class Meta:
    unique_together = ("shop", "name")
    ordering = ["shop", "name"]

  def __str__(self):
    return f"{self.name} ({self.shop.slug})"

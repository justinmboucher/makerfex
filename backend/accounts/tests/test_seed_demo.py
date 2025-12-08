# backend/accounts/tests/test_seed_demo.py
import pytest

from accounts.models import Shop, Employee


@pytest.mark.django_db
def test_seed_creates_demo_shop_and_employees(demo_data):
    shop = Shop.objects.get(slug="silver-grain-woodworks")
    assert shop.name == "Silver Grain Woodworks"

    # We expect at least these three employees
    roles = list(
        Employee.objects.filter(shop=shop)
        .order_by("role")
        .values_list("role", flat=True)
    )

    assert "Owner" in roles
    assert "CNC Operator" in roles
    assert any("Packaging" in r for r in roles)
    assert "Finisher" in roles

# backend/customers/tests/test_customers_api.py
import pytest
from rest_framework.test import APIClient

from accounts.models import Shop


@pytest.mark.django_db
def test_customers_api_returns_list(demo_data):
    client = APIClient()

    # Hit the clean endpoint we set up: /api/customers/
    response = client.get("/api/customers/")

    assert response.status_code == 200
    assert isinstance(response.data, list)
    assert len(response.data) > 0

    # Bonus: sanity check that they belong to the demo shop
    demo_shop = Shop.objects.get(slug="silver-grain-woodworks")
    customer_shop_ids = {c["shop"] for c in response.data if "shop" in c}
    # Either all or none have shop id in serializer; if present, ensure it's the demo shop
    if customer_shop_ids:
        assert customer_shop_ids == {demo_shop.id}

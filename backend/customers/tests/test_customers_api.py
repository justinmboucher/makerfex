import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_customers_api_returns_list(auth_client):
    response = auth_client.get("/api/customers/")
    assert response.status_code == 200

    assert isinstance(response.data, dict)
    assert "results" in response.data
    assert isinstance(response.data["results"], list)

    results = response.data["results"]
    assert len(results) > 0


@pytest.mark.django_db
def test_customers_api_requires_auth(demo_data):
    client = APIClient()
    resp = client.get("/api/customers/")
    assert resp.status_code == 401

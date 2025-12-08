# backend/projects/tests/test_projects_api.py
import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_projects_api_returns_basic_fields(auth_client):
    resp = auth_client.get("/api/projects/")
    assert resp.status_code == 200
    assert isinstance(resp.data, list)
    assert len(resp.data) > 0

    sample = resp.data[0]
    # Fields the frontend will rely on
    for field in ["id", "name", "status", "priority", "due_date"]:
        assert field in sample

@pytest.mark.django_db
def test_projects_api_requires_auth(demo_data):
    client = APIClient()
    resp = client.get("/api/projects/")
    assert resp.status_code == 401
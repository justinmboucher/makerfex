import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_projects_api_returns_basic_fields(demo_data):
    client = APIClient()
    resp = client.get("/api/projects/")
    assert resp.status_code == 200
    assert len(resp.data) > 0

    sample = resp.data[0]
    # Check for some key fields you know the UI will rely on
    for field in ["id", "name", "status", "priority", "due_date"]:
        assert field in sample

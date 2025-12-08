# backend/conftest.py
import pytest
from django.core.management import call_command
from rest_framework.test import APIClient


@pytest.fixture
def demo_data(db):
    """
    Seed the demo Makerfex universe.

    Uses the seed_demo_makerfex management command, which resets
    the demo shop each time it runs.
    """
    call_command("seed_demo_makerfex")


@pytest.fixture
def api_client():
    """
    Bare DRF APIClient.
    """
    return APIClient()


@pytest.fixture
def auth_client(demo_data, api_client):
    """
    APIClient already authenticated as demouser via JWT.
    """
    resp = api_client.post(
        "/api/accounts/token/",
        {"username": "demouser", "password": "demo1234"},
        format="json",
    )
    assert resp.status_code == 200
    token = resp.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client

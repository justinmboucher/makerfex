# backend/accounts/tests/test_auth_jwt.py
import pytest
from rest_framework.test import APIClient
from django.utils import timezone

from accounts.models import Shop


@pytest.mark.django_db
def test_obtain_token_pair_for_demouser(demo_data):
    client = APIClient()
    resp = client.post(
        "/api/accounts/token/",
        {"username": "demouser", "password": "demo1234"},
        format="json",
    )
    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data
    assert isinstance(resp.data["access"], str)
    assert isinstance(resp.data["refresh"], str)


@pytest.mark.django_db
def test_refresh_token_flow(demo_data):
    client = APIClient()

    # Obtain pair
    obtain = client.post(
        "/api/accounts/token/",
        {"username": "demouser", "password": "demo1234"},
        format="json",
    )
    assert obtain.status_code == 200
    access1 = obtain.data["access"]
    refresh = obtain.data["refresh"]

    # Refresh
    refresh_resp = client.post(
        "/api/accounts/token/refresh/",
        {"refresh": refresh},
        format="json",
    )
    assert refresh_resp.status_code == 200
    assert "access" in refresh_resp.data
    access2 = refresh_resp.data["access"]

    # In many cases this will be different, but we just care that it's valid
    assert isinstance(access2, str)
    # Optionally:
    # assert access1 != access2


@pytest.mark.django_db
def test_verify_access_token(demo_data):
    client = APIClient()
    obtain = client.post(
        "/api/accounts/token/",
        {"username": "demouser", "password": "demo1234"},
        format="json",
    )
    assert obtain.status_code == 200
    access = obtain.data["access"]

    verify = client.post(
        "/api/accounts/token/verify/",
        {"token": access},
        format="json",
    )
    assert verify.status_code == 200  # valid token should verify


@pytest.mark.django_db
def test_me_endpoint_returns_user_employee_and_shop(auth_client):
    resp = auth_client.get("/api/accounts/me/")
    assert resp.status_code == 200

    data = resp.data

    assert "user" in data
    assert "employee" in data
    assert "shop" in data

    user = data["user"]
    assert user["username"] == "demouser"

    # Basic sanity checks
    if data["employee"] is not None:
        assert data["employee"]["role"] in ("Owner", "CNC Operator", "Finisher", "Packaging & Shipping Partner")

    if data["shop"] is not None:
        assert data["shop"]["slug"] == "silver-grain-woodworks"

# backend/analytics/utils.py
from typing import Optional

from accounts.models import Shop
from django.contrib.auth import get_user_model

User = get_user_model()


def get_shop_for_user(user) -> Optional[Shop]:
    """
    Resolve the Shop for the current user.

    Current behavior:
    - If user.shop exists, return it.
    - Otherwise, fall back to the first Shop in the system (helpful for dev/demo).
    - If nothing is found, return None.

    Later you can tighten this up and/or handle employee -> shop relationships.
    """
    if not user.is_authenticated:
        return None

    # Preferred: direct relation
    try:
        shop = user.shop
        if shop:
            return shop
    except (Shop.DoesNotExist, AttributeError):
        pass

    # Dev fallback: first shop in DB
    try:
        return Shop.objects.first()
    except Exception:
        return None

# accounts/utils.py
from accounts.models import Employee

def get_shop_for_user(user):
    if not user or not user.is_authenticated:
        return None
    try:
        return Employee.objects.get(user=user, is_active=True).shop
    except Employee.DoesNotExist:
        return None

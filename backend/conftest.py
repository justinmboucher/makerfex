# backend/conftest.py
import pytest
from django.core.management import call_command

@pytest.fixture
def demo_data(db):
    """
    Seed the demo Makerfex universe.

    Uses the seed_demo_makerfex management command, which resets
    the demo shop each time it runs.
    """
    call_command("seed_demo_makerfex")

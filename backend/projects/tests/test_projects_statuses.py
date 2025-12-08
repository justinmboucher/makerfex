# backend/projects/tests/test_projects_statuses.py
import pytest
from django.utils import timezone

from projects.models import Project


@pytest.mark.django_db
def test_projects_have_overdue_and_future_due_mix(demo_data):
    today = timezone.now().date()

    projects = Project.objects.all()
    assert projects.count() > 0

    active = projects.filter(status=Project.Status.ACTIVE)

    overdue = active.filter(due_date__lt=today)
    future_due = active.filter(due_date__gt=today)

    # We want at least one of each for testing UI/logic
    assert overdue.exists(), "Expected at least one active overdue project in demo data."
    assert future_due.exists(), "Expected at least one active future-due project in demo data."

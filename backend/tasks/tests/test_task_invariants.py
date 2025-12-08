import pytest
from tasks.models import Task

@pytest.mark.django_db
def test_task_shop_matches_project_shop(demo_data):
    for task in Task.objects.select_related("shop", "project__shop"):
        assert task.shop == task.project.shop
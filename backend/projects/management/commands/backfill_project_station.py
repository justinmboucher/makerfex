from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count

from projects.models import Project
from tasks.models import Task


class Command(BaseCommand):
    help = "Backfill Project.station using Task.station (preferred) or assigned_to.stations (fallback)."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Do not write changes; only report.")
        parser.add_argument("--limit", type=int, default=0, help="Limit number of projects processed (0 = no limit).")
        parser.add_argument("--shop-id", type=int, default=0, help="Process only one shop id (0 = all shops).")

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        limit = options["limit"]
        shop_id = options["shop_id"]

        qs = Project.objects.filter(station__isnull=True)

        if shop_id:
            qs = qs.filter(shop_id=shop_id)

        qs = qs.select_related("assigned_to", "shop").order_by("id")

        if limit and limit > 0:
            qs = qs[:limit]

        total = 0
        updated = 0
        skipped_no_signal = 0
        skipped_conflict = 0

        def infer_from_tasks(project_id: int):
            """
            Return (station_id or None, conflict_bool).
            We prefer the station of the most recent task that has station set.
            This resolves multi-station histories into a single 'current station'.
            """
            latest = (
                Task.objects
                .filter(project_id=project_id, station__isnull=False)
                .order_by("-updated_at", "-created_at", "-id")
                .values_list("station_id", flat=True)
                .first()
            )
            if latest:
                return latest, False
            return None, False

        def infer_from_assignee(project: Project):
            assignee = project.assigned_to
            if not assignee:
                return None, False

            stations = assignee.stations.all()
            if stations.count() == 1:
                return stations.first().id, False

            if stations.count() > 1:
                return None, True

            return None, False

        with transaction.atomic():
            for p in qs.iterator():
                total += 1

                # 1) Prefer tasks signal
                station_id, conflict = infer_from_tasks(p.id)
                if conflict:
                    skipped_conflict += 1
                    continue

                # 2) Fallback to assignee’s single-station membership
                if not station_id:
                    station_id, conflict = infer_from_assignee(p)
                    if conflict:
                        skipped_conflict += 1
                        continue

                if not station_id:
                    skipped_no_signal += 1
                    continue

                if dry_run:
                    updated += 1
                    continue

                p.station_id = station_id
                p.save(update_fields=["station"])
                updated += 1

            if dry_run:
                transaction.set_rollback(True)

        self.stdout.write(self.style.SUCCESS("Project.station backfill complete"))
        self.stdout.write(f"Dry run: {dry_run}")
        self.stdout.write(f"Processed: {total}")
        self.stdout.write(f"Would update / Updated: {updated}")
        self.stdout.write(f"Skipped (no signal): {skipped_no_signal}")
        self.stdout.write(f"Skipped (conflict): {skipped_conflict}")

from django.core.management.base import BaseCommand
from django.db import transaction

from projects.models import Project


class Command(BaseCommand):
    help = "For completed projects, set current_stage to the workflow final stage if missing."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--shop-id", type=int, default=0)
        parser.add_argument("--limit", type=int, default=0)

    def handle(self, *args, **opts):
        dry = opts["dry_run"]
        shop_id = opts["shop_id"]
        limit = opts["limit"]

        qs = Project.objects.select_related("workflow", "current_stage").filter(workflow__isnull=False)

        if shop_id:
            qs = qs.filter(shop_id=shop_id)

        # “completed” signal (supports both worlds)
        qs = qs.filter(status="completed") | qs.filter(completed_at__isnull=False)

        qs = qs.filter(current_stage__isnull=True) | qs.filter(current_stage__is_final=False)

        qs = qs.order_by("id")
        if limit and limit > 0:
            qs = qs[:limit]

        processed = 0
        updated = 0
        skipped_no_final = 0

        with transaction.atomic():
            for p in qs.iterator():
                processed += 1

                wf = p.workflow
                if not wf:
                    continue

                final_stage = wf.stages.filter(is_final=True, is_active=True).order_by("order", "id").last()
                if not final_stage:
                    skipped_no_final += 1
                    continue

                if not dry:
                    p.current_stage = final_stage
                    p.save(update_fields=["current_stage"])
                updated += 1

            if dry:
                transaction.set_rollback(True)

        self.stdout.write(self.style.SUCCESS("backfill_project_final_stage complete"))
        self.stdout.write(f"Dry run: {dry}")
        self.stdout.write(f"Processed: {processed}")
        self.stdout.write(f"Updated: {updated}")
        self.stdout.write(f"Skipped (no final stage): {skipped_no_final}")

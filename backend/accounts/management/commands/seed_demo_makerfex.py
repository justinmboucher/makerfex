# backend/accounts/management/commands/seed_demo_makerfex.py

import random
from datetime import timedelta, date

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from accounts.models import Shop, Employee, Station
from config.models import ShopConfig, IntegrationConfig
from customers.models import Customer
from workflows.models import Workflow, WorkflowStage
from projects.models import Project
from tasks.models import Task
from inventory.models import Material, Consumable, Equipment
from products.models import ProductTemplate, ProjectPromotion
from sales.models import SalesOrder, SalesOrderLine
from analytics.models import AnalyticsSnapshot, AnalyticsEvent
from assistants.models import AssistantProfile, AssistantSession, AssistantMessage


class Command(BaseCommand):
    help = "Reset and seed a demo woodworking shop with sample data for Makerfex."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Resetting and seeding demo Makerfex data..."))

        User = get_user_model()
        now = timezone.now()
        today = now.date()
        months_back = 12  # rolling year

        # -----------------------------
        # 0) Wipe previous demo shop
        # -----------------------------
        demo_slug = "silver-grain-woodworks"
        existing_shop = Shop.objects.filter(slug=demo_slug).first()
        if existing_shop:
            self.stdout.write(f"Found existing demo shop '{demo_slug}', deleting it...")
            existing_shop.delete()
            self.stdout.write(self.style.WARNING("✓ Previous demo shop and related data removed."))

        # -----------------------------
        # 1) Users + Shop + Employees
        # -----------------------------
        demouser, _ = User.objects.get_or_create(
            username="demouser",
            defaults={
                "email": "demouser@example.org",
                "first_name": "Demo",
                "last_name": "User",
            },
        )
        demouser.set_password("demo1234")
        demouser.is_staff = True
        demouser.is_superuser = True
        demouser.save()

        cnc_user, _ = User.objects.get_or_create(
            username="cnc_operator",
            defaults={
                "email": "cnc@example.org",
                "first_name": "Casey",
                "last_name": "Nguyen",
            },
        )
        cnc_user.set_password("demo1234")
        cnc_user.save()

        finisher_user, _ = User.objects.get_or_create(
            username="finisher",
            defaults={
                "email": "finisher@example.org",
                "first_name": "Jordan",
                "last_name": "Reed",
            },
        )
        finisher_user.set_password("demo1234")
        finisher_user.save()

        shop = Shop.objects.create(
            slug=demo_slug,
            name="Silver Grain Woodworks",
            legal_name="Silver Grain Woodworks LLC",
            email="info@silvergrain.example.org",
            phone="+1-555-123-4567",
            website="https://example.org/silver-grain",
            timezone="America/Chicago",
            currency_code="USD",
            is_active=True,
        )

        owner_employee = Employee.objects.create(
            shop=shop,
            user=demouser,
            first_name="Demo",
            last_name="Owner",
            email="demouser@example.org",
            role="Owner",
            is_manager=True,
            is_active=True,
        )

        cnc_employee = Employee.objects.create(
            shop=shop,
            user=cnc_user,
            first_name="Casey",
            last_name="Nguyen",
            email="cnc@example.org",
            role="CNC Operator",
            is_manager=False,
            is_active=True,
        )

        packaging_employee = Employee.objects.create(
            shop=shop,
            user=None,
            first_name="PackRight",
            last_name="Fulfillment",
            email="packaging@example.org",
            role="Packaging & Shipping Partner",
            is_manager=False,
            is_active=True,
        )

        finisher_employee = Employee.objects.create(
            shop=shop,
            user=finisher_user,
            first_name="Jordan",
            last_name="Reed",
            email="finisher@example.org",
            role="Finisher",
            is_manager=False,
            is_active=True,
        )

        self.stdout.write(self.style.SUCCESS("✓ Users, shop, and employees created."))

        # -----------------------------
        # 2) ShopConfig + Integrations
        # -----------------------------
        ShopConfig.objects.create(
            shop=shop,
            enable_inventory=True,
            enable_analytics=True,
            enable_time_tracking=True,
            enable_assistants=True,
            default_hourly_rate=75,
            default_project_priority="normal",
            working_hours={
                "mon": ["09:00", "17:00"],
                "tue": ["09:00", "17:00"],
                "wed": ["09:00", "17:00"],
                "thu": ["09:00", "17:00"],
                "fri": ["09:00", "17:00"],
            },
            locale="en-US",
        )

        IntegrationConfig.objects.create(
            shop=shop,
            provider=IntegrationConfig.Provider.ETSY,
            name="Main Etsy Shop",
            is_active=True,
            credentials={"token": "demo-token-placeholder"},
            settings={"shop_name": "SilverGrainWoodworks"},
        )

        self.stdout.write(self.style.SUCCESS("✓ Config and integration created."))

        # -----------------------------
        # 3) Stations
        # -----------------------------
        table_saw = Station.objects.create(shop=shop, name="Table Saw", code="TS-01")
        cnc_station = Station.objects.create(shop=shop, name="CNC Router", code="CNC-01")
        assembly_bench = Station.objects.create(shop=shop, name="Assembly Bench", code="ASM-01")
        finishing_booth = Station.objects.create(shop=shop, name="Finishing Booth", code="FIN-01")
        packing_station = Station.objects.create(shop=shop, name="Packing & Shipping", code="PACK-01")

        cnc_station.employees.add(cnc_employee)
        finishing_booth.employees.add(finisher_employee)
        packing_station.employees.add(packaging_employee)
        assembly_bench.employees.add(owner_employee, finisher_employee)

        self.stdout.write(self.style.SUCCESS("✓ Stations created."))

        # -----------------------------
        # 4) Workflow + Stages
        # -----------------------------
        workflow = Workflow.objects.create(
            shop=shop,
            name="Woodworking - Standard",
            description="Standard woodworking workflow from inquiry to completion.",
            is_default=True,
            is_active=True,
            created_by=owner_employee,
        )

        stage_defs = [
            ("Inquiry", 10, True, False),
            ("Design", 20, False, False),
            ("Cut & Mill", 30, False, False),
            ("Assembly", 40, False, False),
            ("Finishing", 50, False, False),
            ("Ready to Ship", 60, False, False),
            ("Completed", 70, False, True),
        ]

        stage_map = {}
        for name, order, is_initial, is_final in stage_defs:
            stage = WorkflowStage.objects.create(
                workflow=workflow,
                name=name,
                order=order,
                is_initial=is_initial,
                is_final=is_final,
                wip_limit=0,
                is_active=True,
            )
            stage_map[name] = stage

        self.stdout.write(self.style.SUCCESS("✓ Workflow and stages created."))

        # -----------------------------
        # 5) Customers (rolling year)
        # -----------------------------
        first_names = [
            "Alex", "Taylor", "Morgan", "Riley", "Sam", "Casey",
            "Jordan", "Avery", "Quinn", "Hayden", "Jamie", "Cameron",
        ]
        last_names = [
            "Smith", "Johnson", "Lee", "Garcia", "Brown",
            "Davis", "Miller", "Wilson", "Moore", "Anderson",
        ]

        customers = []
        num_customers = 25

        for i in range(num_customers):
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            email = f"{fn.lower()}.{ln.lower()}{i}@example.org"

            # Creation anywhere in last 12 months
            days_ago = random.randint(10, months_back * 30)
            created_dt = now - timedelta(days=days_ago)

            customer = Customer.objects.create(
                shop=shop,
                first_name=fn,
                last_name=ln,
                email=email,
                phone=f"+1-555-01{i:02d}",
                city="Springfield",
                region="IL",
                postal_code="62701",
                country_code="US",
                is_vip=(i % 10 == 0),
                source=random.choice(["Etsy", "Website", "Local fair"]),
                notes="Demo seeded customer.",
            )

            # Backdate timestamps
            Customer.objects.filter(pk=customer.pk).update(
                created_at=created_dt,
                updated_at=created_dt,
            )
            customer.created_at = created_dt
            customer.updated_at = created_dt

            customers.append(customer)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(customers)} customers created."))

        # -----------------------------
        # 6) Product Templates
        # -----------------------------
        templates_data = [
            ("Walnut Coffee Table", "walnut-coffee-table", 850, 18),
            ("Charcuterie Board", "charcuterie-board", 120, 3),
            ("Floating Shelf Set", "floating-shelf-set", 220, 6),
            ("Maple Desk", "maple-desk", 650, 16),
        ]

        templates = []
        for name, slug, price, hours in templates_data:
            tmpl = ProductTemplate.objects.create(
                shop=shop,
                name=name,
                slug=slug,
                description=f"Demo product template: {name}",
                base_price=price,
                estimated_hours=hours,
                default_workflow=workflow,
                is_active=True,
            )
            templates.append(tmpl)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(templates)} product templates created."))

        # -----------------------------
        # 7) Projects (with stable mix)
        # -----------------------------
        projects = []

        num_projects = 30
        for i in range(num_projects):
            customer = random.choice(customers)
            template = random.choice(templates)

            # Decide "type" of project scenario
            scenario = random.choices(
                [
                    "completed_on_time",
                    "completed_late",
                    "active_future",
                    "active_overdue",
                    "cancelled_midway",
                    "on_hold",
                ],
                weights=[0.25, 0.15, 0.2, 0.15, 0.15, 0.1],
            )[0]

            # Base: created sometime in last 12 months
            created_days_ago = random.randint(15, months_back * 30)
            created_dt = now - timedelta(days=created_days_ago)

            # Start date after creation
            start_date = (created_dt + timedelta(days=random.randint(0, 7))).date()

            # Build scenario-specific status and dates
            if scenario == "completed_on_time":
                status = Project.Status.COMPLETED
                due_date = start_date + timedelta(days=random.randint(14, 60))
                completed_at = timezone.make_aware(
                    datetime_from_date(due_date - timedelta(days=random.randint(0, 3)))
                )
                current_stage = stage_map["Completed"]

            elif scenario == "completed_late":
                status = Project.Status.COMPLETED
                due_date = start_date + timedelta(days=random.randint(14, 45))
                completed_at = timezone.make_aware(
                    datetime_from_date(due_date + timedelta(days=random.randint(1, 14)))
                )
                current_stage = stage_map["Completed"]

            elif scenario == "active_future":
                status = Project.Status.ACTIVE
                # due date in the near future (1–30 days ahead)
                due_date = today + timedelta(days=random.randint(1, 30))
                completed_at = None
                current_stage = random.choice(
                    [
                        stage_map["Design"],
                        stage_map["Cut & Mill"],
                        stage_map["Assembly"],
                        stage_map["Finishing"],
                        stage_map["Ready to Ship"],
                    ]
                )

            elif scenario == "active_overdue":
                status = Project.Status.ACTIVE
                # due date in the recent past (1–30 days ago)
                due_date = today - timedelta(days=random.randint(1, 30))
                completed_at = None
                current_stage = random.choice(
                    [
                        stage_map["Design"],
                        stage_map["Cut & Mill"],
                        stage_map["Assembly"],
                        stage_map["Finishing"],
                        stage_map["Ready to Ship"],
                    ]
                )

            elif scenario == "cancelled_midway":
                status = Project.Status.CANCELLED
                due_date = start_date + timedelta(days=random.randint(14, 60))
                completed_at = None
                current_stage = random.choice(
                    [stage_map["Design"], stage_map["Assembly"], stage_map["Finishing"]]
                )

            else:  # on_hold
                status = Project.Status.ON_HOLD
                due_date = start_date + timedelta(days=random.randint(21, 90))
                completed_at = None
                current_stage = random.choice(
                    [stage_map["Design"], stage_map["Assembly"], stage_map["Finishing"]]
                )

            priority = random.choice(
                [
                    Project.Priority.LOW,
                    Project.Priority.NORMAL,
                    Project.Priority.HIGH,
                    Project.Priority.RUSH,
                ]
            )

            project_name = f"{template.name} #{1000 + i}"

            project = Project.objects.create(
                shop=shop,
                customer=customer,
                name=project_name,
                reference_code=f"SG-{1000 + i}",
                description=f"Demo project based on {template.name}.",
                workflow=workflow,
                current_stage=current_stage,
                priority=priority,
                status=status,
                start_date=start_date,
                due_date=due_date,
                completed_at=completed_at,
                created_by=owner_employee,
                assigned_to=random.choice(
                    [owner_employee, cnc_employee, finisher_employee]
                ),
                estimated_hours=template.estimated_hours,
                actual_hours=None,
                is_archived=False,
            )

            Project.objects.filter(pk=project.pk).update(
                created_at=created_dt, updated_at=created_dt
            )
            project.created_at = created_dt
            project.updated_at = created_dt

            projects.append(project)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(projects)} projects created."))

        # -----------------------------
        # 8) Tasks
        # -----------------------------
        task_statuses = [
            Task.Status.TODO,
            Task.Status.IN_PROGRESS,
            Task.Status.BLOCKED,
            Task.Status.DONE,
        ]

        station_choices = [
            (stage_map["Cut & Mill"], table_saw),
            (stage_map["Cut & Mill"], cnc_station),
            (stage_map["Assembly"], assembly_bench),
            (stage_map["Finishing"], finishing_booth),
            (stage_map["Ready to Ship"], packing_station),
        ]

        tasks = []
        for project in projects:
            if project.status == Project.Status.CANCELLED:
                num_tasks = random.randint(1, 3)
            else:
                num_tasks = random.randint(3, 7)

            for order_index in range(num_tasks):
                stage, station = random.choice(station_choices)
                status = random.choice(task_statuses)

                title = f"Task {order_index + 1} for {project.name}"
                est_hours = round(random.uniform(0.5, 4.0), 1)
                act_hours = None
                if status in {Task.Status.IN_PROGRESS, Task.Status.DONE}:
                    act_hours = round(est_hours * random.uniform(0.5, 1.5), 1)

                task = Task.objects.create(
                    shop=shop,
                    project=project,
                    title=title,
                    description="Demo task for seeded project.",
                    status=status,
                    stage=stage,
                    station=station,
                    assignee=random.choice(
                        [owner_employee, cnc_employee, finisher_employee, None]
                    ),
                    order=order_index + 1,
                    estimated_hours=est_hours,
                    actual_hours=act_hours,
                    due_date=project.due_date,
                )

                tasks.append(task)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(tasks)} tasks created."))

        # -----------------------------
        # 9) Inventory
        # -----------------------------
        mats = [
            ("Walnut Board 4/4", "WAL-44", "board ft", 120, 40, 9.50, "Hardwood"),
            ("Maple Plywood 3/4", "MAP-PW-34", "sheet", 25, 10, 85.00, "Plywood"),
        ]
        for name, sku, uom, qty, reorder, cost, mtype in mats:
            Material.objects.create(
                shop=shop,
                name=name,
                sku=sku,
                unit_of_measure=uom,
                quantity_on_hand=qty,
                reorder_point=reorder,
                unit_cost=cost,
                preferred_station=table_saw,
                material_type=mtype,
                is_active=True,
            )

        consumables_data = [
            ("Titebond III Glue", "GLUE-TB3", "bottle", 12, 4, 13.99, "Adhesive"),
            ("220-grit Sandpaper", "SP-220", "pack", 30, 10, 7.50, "Abrasive"),
            ("Polyurethane Finish", "FIN-PU", "quart", 8, 3, 24.00, "Finish"),
        ]
        for name, sku, uom, qty, reorder, cost, ctype in consumables_data:
            Consumable.objects.create(
                shop=shop,
                name=name,
                sku=sku,
                unit_of_measure=uom,
                quantity_on_hand=qty,
                reorder_point=reorder,
                unit_cost=cost,
                preferred_station=finishing_booth,
                consumable_type=ctype,
                is_active=True,
            )

        equipment_data = [
            ("SawStop PCS Table Saw", "EQ-TS-SS", "unit", table_saw),
            ("Shapeoko CNC Router", "EQ-CNC-SH", "unit", cnc_station),
            ("HVLP Sprayer", "EQ-HVLP-01", "unit", finishing_booth),
        ]
        for name, sku, uom, station in equipment_data:
            Equipment.objects.create(
                shop=shop,
                name=name,
                sku=sku,
                unit_of_measure=uom,
                quantity_on_hand=1,
                reorder_point=0,
                unit_cost=0,  # purchase cost not super important for demo
                preferred_station=station,
                serial_number=f"SN-{random.randint(100000, 999999)}",
                purchase_date=today - timedelta(days=random.randint(365, 365 * 3)),
                warranty_expiration=today + timedelta(days=365),
                is_active=True,
            )

        self.stdout.write(self.style.SUCCESS("✓ Inventory created."))

        # -----------------------------
        # 10) Promotions
        # -----------------------------
        promotions = []
        for project in random.sample(projects, min(8, len(projects))):
            promo = ProjectPromotion.objects.create(
                project=project,
                channel=random.choice(
                    [
                        ProjectPromotion.Channel.ETSY,
                        ProjectPromotion.Channel.INSTAGRAM,
                        ProjectPromotion.Channel.WEBSITE,
                    ]
                ),
                status=ProjectPromotion.Status.ACTIVE,
                title=f"Promo for {project.name}",
                link_url="https://example.org/demo-listing",
                notes="Demo project promotion.",
                started_at=project.created_at + timedelta(days=3),
            )
            promotions.append(promo)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(promotions)} promotions created."))

        # -----------------------------
        # 11) Sales Orders + Lines (rolling year)
        # -----------------------------
        orders = []
        lines = []
        num_orders = 20

        for i in range(num_orders):
            customer = random.choice(customers)
            project = random.choice(projects)
            tmpl = random.choice(templates)

            # Order date in last 12 months
            days_ago = random.randint(5, months_back * 30)
            order_date = today - timedelta(days=days_ago)

            status = random.choices(
                [
                    SalesOrder.Status.PAID,
                    SalesOrder.Status.OPEN,
                    SalesOrder.Status.DRAFT,
                    SalesOrder.Status.CANCELLED,
                    SalesOrder.Status.REFUNDED,
                ],
                weights=[0.6, 0.15, 0.1, 0.1, 0.05],
            )[0]

            order_number = f"SGO-{2000 + i}"

            order = SalesOrder.objects.create(
                shop=shop,
                customer=customer,
                project=project,
                order_number=order_number,
                status=status,
                source=random.choice(
                    [
                        SalesOrder.Source.ETSY,
                        SalesOrder.Source.WEBSITE,
                        SalesOrder.Source.POS,
                    ]
                ),
                order_date=order_date,
                due_date=order_date + timedelta(days=14),
                currency_code="USD",
            )

            num_lines = random.randint(1, 2)
            subtotal = 0
            for _ in range(num_lines):
                qty = random.choice([1, 1, 1, 2])
                unit_price = tmpl.base_price or random.randint(100, 900)
                line_total = qty * unit_price
                line = SalesOrderLine.objects.create(
                    order=order,
                    product_template=tmpl,
                    project=project,
                    description=f"{tmpl.name}",
                    quantity=qty,
                    unit_price=unit_price,
                    line_total=line_total,
                )
                subtotal += line_total
                lines.append(line)

            tax = round(subtotal * 0.08, 2)
            total = subtotal + tax

            order.subtotal_amount = subtotal
            order.tax_amount = tax
            order.total_amount = total
            order.save()

            SalesOrder.objects.filter(pk=order.pk).update(
                created_at=timezone.make_aware(datetime_from_date(order_date)),
                updated_at=timezone.make_aware(datetime_from_date(order_date)),
            )

            orders.append(order)

        self.stdout.write(
            self.style.SUCCESS(f"✓ {len(orders)} sales orders and {len(lines)} lines created.")
        )

        # -----------------------------
        # 12) Analytics Snapshots (rolling)
        # -----------------------------
        snapshots = []
        revenue_by_month = {}

        for order in orders:
            if not order.total_amount or order.status != SalesOrder.Status.PAID:
                continue
            od = order.order_date
            key = (od.year, od.month)
            revenue_by_month[key] = revenue_by_month.get(key, 0) + float(order.total_amount)

        for (year, month), value in revenue_by_month.items():
            snapshot_date = date(year, month, 1)
            snap = AnalyticsSnapshot.objects.create(
                shop=shop,
                metric_key="monthly_revenue",
                label="Monthly revenue (paid orders)",
                snapshot_date=snapshot_date,
                value=value,
                extra={},
            )
            snapshots.append(snap)

        open_by_month = {}
        for project in projects:
            if project.status not in {Project.Status.ACTIVE, Project.Status.ON_HOLD}:
                continue
            dt = project.created_at.date()
            key = (dt.year, dt.month)
            open_by_month[key] = open_by_month.get(key, 0) + 1

        for (year, month), count in open_by_month.items():
            snapshot_date = date(year, month, 1)
            snap = AnalyticsSnapshot.objects.create(
                shop=shop,
                metric_key="open_projects",
                label="Open projects created this month",
                snapshot_date=snapshot_date,
                value=count,
                extra={},
            )
            snapshots.append(snap)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(snapshots)} analytics snapshots created."))

        # -----------------------------
        # 13) Analytics Events
        # -----------------------------
        events = []

        for project in projects:
            ev = AnalyticsEvent.objects.create(
                shop=shop,
                event_type="project_created",
                source="seed_demo",
                occurred_at=timezone.make_aware(
                    datetime_from_date(project.created_at.date())
                ),
                payload={
                    "project_id": project.id,
                    "status": project.status,
                    "priority": project.priority,
                },
            )
            events.append(ev)

            if project.completed_at:
                ev = AnalyticsEvent.objects.create(
                    shop=shop,
                    event_type="project_completed",
                    source="seed_demo",
                    occurred_at=project.completed_at,
                    payload={
                        "project_id": project.id,
                        "status": project.status,
                    },
                )
                events.append(ev)

        for order in orders:
            if order.status == SalesOrder.Status.PAID:
                ev = AnalyticsEvent.objects.create(
                    shop=shop,
                    event_type="order_paid",
                    source=order.source,
                    occurred_at=timezone.make_aware(
                        datetime_from_date(order.order_date)
                    ),
                    payload={
                        "order_id": order.id,
                        "total_amount": float(order.total_amount or 0),
                    },
                )
                events.append(ev)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(events)} analytics events created."))

        # -----------------------------
        # 14) Assistants
        # -----------------------------
        assistant = AssistantProfile.objects.create(
            shop=shop,
            slug="makerfex-coach",
            name="Makerfex Coach",
            description="Helps optimize Makerfex workflows and project estimates.",
            role_prompt="You are a helpful assistant for a small woodworking shop using Makerfex.",
            default_model_name="gpt-5.1",
            is_active=True,
        )

        session = AssistantSession.objects.create(
            shop=shop,
            assistant=assistant,
            created_by=owner_employee,
            title="Improving lead times on coffee tables",
            status=AssistantSession.Status.ACTIVE,
            last_activity_at=now,
            metadata={"demo": True},
        )

        AssistantMessage.objects.create(
            session=session,
            role=AssistantMessage.Role.USER,
            content="How can I reduce turnaround time on walnut coffee tables?",
            metadata={"demo": True},
        )
        AssistantMessage.objects.create(
            session=session,
            role=AssistantMessage.Role.ASSISTANT,
            content="You can start by standardizing your cut list and batching glue-ups.",
            metadata={"demo": True},
        )

        self.stdout.write(self.style.SUCCESS("✓ Assistant profile, session, and messages created."))
        self.stdout.write(self.style.SUCCESS("Demo Makerfex data reset + seeding complete. 🎉"))



def datetime_from_date(d: date):
    """
    Helper to create a timezone-naive datetime at noon for a given date.
    Useful for backdating created_at/occurred_at fields.
    """
    from datetime import datetime

    return datetime(d.year, d.month, d.day, 12, 0, 0)

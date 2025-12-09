import re
import difflib
from difflib import SequenceMatcher

from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from customers.models import Customer
from projects.models import Project
from inventory.models import Material, Consumable, Equipment
from workflows.models import Workflow


def parse_query(raw_q: str):
    """
    Parse a single free-text query string into:
      - base_q: remaining text after removing operators
      - filters: {
          customer, project, inventory, workflow, status,
          price_op, price_value
        }

    Supported operators:
      customer:john
      project:"maple board"
      inventory:walnut
      workflow:"shop setup"
      status:active
      price>50, price<=200, price=100
    """
    if not raw_q:
        return "", {}

    q = raw_q
    filters: dict[str, str] = {}

    # ---- Price operator: price>50, price<=200, price = 100 ----
    price_pattern = re.compile(
        r"price\s*([<>]=?|=)\s*([0-9]+(?:\.[0-9]+)?)",
        re.IGNORECASE,
    )
    price_match = price_pattern.search(q)
    if price_match:
        filters["price_op"] = price_match.group(1)
        filters["price_value"] = price_match.group(2)
        q = price_pattern.sub(" ", q, count=1)

    # ---- Field:value operators ----
    # Handle quoted first, e.g. project:"maple cutting board"
    field_names = ["customer", "project", "inventory", "workflow", "status"]
    for field in field_names:
        # field:"some value with spaces"
        quoted_pattern = re.compile(
            rf"{field}\s*:\s*\"([^\"]+)\"",
            re.IGNORECASE,
        )
        while True:
            m = quoted_pattern.search(q)
            if not m:
                break
            filters[field] = m.group(1).strip()
            q = q[: m.start()] + " " + q[m.end() :]

        # field:value (no spaces in value)
        simple_pattern = re.compile(
            rf"{field}\s*:\s*([^\s]+)",
            re.IGNORECASE,
        )
        while True:
            m = simple_pattern.search(q)
            if not m:
                break
            # Don't overwrite quoted if we already captured it
            if field not in filters:
                filters[field] = m.group(1).strip()
            q = q[: m.start()] + " " + q[m.end() :]

    # Collapse leftover whitespace
    base_q = " ".join(q.split())
    return base_q, filters


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get_shop(self, user):
        """
        Try multiple ways to resolve the current user's shop.

        Makerfex likely uses something like:
          user -> employee -> shop

        We'll try:
          - user.shop
          - user.employee.shop
          - user.profile.shop
        and fall back to None if nothing is found.
        """
        # 1) Direct FK: user.shop
        try:
            if getattr(user, "shop", None):
                return user.shop
        except Exception:
            pass

        # 2) Employee relation: user.employee.shop
        try:
            employee = getattr(user, "employee", None)
            if employee and getattr(employee, "shop", None):
                return employee.shop
        except Exception:
            pass

        # 3) Profile-style relation: user.profile.shop
        try:
            profile = getattr(user, "profile", None)
            if profile and getattr(profile, "shop", None):
                return profile.shop
        except Exception:
            pass

        return None

    def get(self, request):
        user = request.user
        shop = self.get_shop(user)

        # If we can resolve a shop, we restrict by it.
        # If not, we still return results (dev-friendly).
        restrict_by_shop = shop is not None

        raw_q_param = (request.query_params.get("q") or "").strip()
        base_q, op_filters = parse_query(raw_q_param)

        # Allow explicit query params to override parsed operators (future-safe)
        customer_filter = (
            request.query_params.get("customer")
            or op_filters.get("customer", "")
        ).strip()
        project_filter = (
            request.query_params.get("project")
            or op_filters.get("project", "")
        ).strip()
        inventory_filter = (
            request.query_params.get("inventory")
            or op_filters.get("inventory", "")
        ).strip()
        workflow_filter = (
            request.query_params.get("workflow")
            or op_filters.get("workflow", "")
        ).strip()
        status_filter = (
            request.query_params.get("status")
            or op_filters.get("status", "")
        ).strip()

        price_value = (
            request.query_params.get("price")
            or op_filters.get("price_value")
        )
        price_op = (
            request.query_params.get("price_op")
            or op_filters.get("price_op")
        )

        q = base_q  # base free-text portion

        # ---- Helper: price lookup mapping ----
        def apply_price_filter(qs, field_name):
            if price_value and price_op in (">", "<", ">=", "<=", "="):
                lookup_map = {
                    ">": "gt",
                    "<": "lt",
                    ">=": "gte",
                    "<=": "lte",
                    "=": "exact",
                }
                lookup = lookup_map[price_op]
                qs = qs.filter(**{f"{field_name}__{lookup}": price_value})
            return qs

        results = []
        seen = set()  # (type, id-like) to avoid duplicates

        # ==========================
        #        CUSTOMERS
        # ==========================
        customer_qs = Customer.objects.all()
        if restrict_by_shop:
            customer_qs = customer_qs.filter(shop=shop)

        # Only filter is_active if it exists
        if hasattr(Customer, "is_active"):
            try:
                customer_qs = customer_qs.filter(is_active=True)
            except Exception:
                pass

        if q:
            customer_qs = customer_qs.filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(email__icontains=q)
                | Q(company_name__icontains=q)
            )

        if customer_filter:
            customer_qs = customer_qs.filter(
                Q(first_name__icontains=customer_filter)
                | Q(last_name__icontains=customer_filter)
                | Q(email__icontains=customer_filter)
                | Q(company_name__icontains=customer_filter)
            )

        customer_qs = customer_qs.order_by("last_name", "first_name")[:5]

        for cust in customer_qs:
            full_name = f"{cust.first_name} {cust.last_name}".strip()
            subtitle = cust.email or cust.company_name or ""
            key = ("customer", cust.id)
            if key in seen:
                continue
            seen.add(key)
            results.append(
                {
                    "id": cust.id,
                    "type": "customer",
                    "label": full_name or "Customer",
                    "subtitle": subtitle,
                    "url": f"/customers/{cust.id}/",
                }
            )

        # ==========================
        #          PROJECTS
        # ==========================
        project_qs = Project.objects.all()
        if restrict_by_shop:
            project_qs = project_qs.filter(shop=shop)

        if hasattr(Project, "is_active"):
            try:
                project_qs = project_qs.filter(is_active=True)
            except Exception:
                pass

        if q:
            project_qs = project_qs.filter(
                Q(name__icontains=q)
                | Q(description__icontains=q)
                | Q(reference_code__icontains=q)
            )

        if project_filter:
            project_qs = project_qs.filter(
                Q(name__icontains=project_filter)
                | Q(reference_code__icontains=project_filter)
            )

        if status_filter and hasattr(Project, "status"):
            project_qs = project_qs.filter(status__icontains=status_filter)

        # Using estimated_hours as numeric field for price-style filtering
        project_qs = apply_price_filter(project_qs, "estimated_hours")

        if hasattr(Project, "updated_at"):
            project_qs = project_qs.order_by("-updated_at")
        else:
            project_qs = project_qs.order_by("-id")

        project_qs = project_qs[:5]

        for proj in project_qs:
            label = proj.name or "Project"
            subtitle_parts = []
            if getattr(proj, "reference_code", None):
                subtitle_parts.append(proj.reference_code)
            if getattr(proj, "status", None):
                subtitle_parts.append(proj.status)
            subtitle = " · ".join(subtitle_parts)
            key = ("project", proj.id)
            if key in seen:
                continue
            seen.add(key)
            results.append(
                {
                    "id": proj.id,
                    "type": "project",
                    "label": label,
                    "subtitle": subtitle,
                    "url": f"/projects/{proj.id}/",
                }
            )

        # ==========================
        #    INVENTORY (Materials / Consumables / Equipment)
        # ==========================

        def base_inventory_qs(model_cls):
            qs = model_cls.objects.all()
            if restrict_by_shop:
                qs = qs.filter(shop=shop)
            if hasattr(model_cls, "is_active"):
                try:
                    qs = qs.filter(is_active=True)
                except Exception:
                    pass
            if q:
                qs = qs.filter(
                    Q(name__icontains=q)
                    | Q(sku__icontains=q)
                    | Q(description__icontains=q)
                )
            if inventory_filter:
                qs = qs.filter(
                    Q(name__icontains=inventory_filter)
                    | Q(sku__icontains=inventory_filter)
                )
            qs = apply_price_filter(qs, "unit_cost")
            return qs.order_by("name")[:5]

        inventory_items = []

        for item in base_inventory_qs(Material):
            key = ("inventory", f"material-{item.id}")
            if key in seen:
                continue
            seen.add(key)
            inventory_items.append(
                {
                    "id": item.id,
                    "type": "inventory",
                    "label": getattr(item, "name", "") or "Material",
                    "subtitle": getattr(item, "sku", "") or "",
                    "url": f"/inventory/materials/{item.id}/",
                }
            )

        for item in base_inventory_qs(Consumable):
            key = ("inventory", f"consumable-{item.id}")
            if key in seen:
                continue
            seen.add(key)
            inventory_items.append(
                {
                    "id": item.id,
                    "type": "inventory",
                    "label": getattr(item, "name", "") or "Consumable",
                    "subtitle": getattr(item, "sku", "") or "",
                    "url": f"/inventory/consumables/{item.id}/",
                }
            )

        for item in base_inventory_qs(Equipment):
            key = ("inventory", f"equipment-{item.id}")
            if key in seen:
                continue
            seen.add(key)
            inventory_items.append(
                {
                    "id": item.id,
                    "type": "inventory",
                    "label": getattr(item, "name", "") or "Equipment",
                    "subtitle": getattr(item, "sku", "") or "",
                    "url": f"/inventory/equipment/{item.id}/",
                }
            )

        # Cap inventory slice
        results.extend(inventory_items[:5])

        # ==========================
        #          WORKFLOWS
        # ==========================
        wf_qs = Workflow.objects.all()
        if restrict_by_shop:
            wf_qs = wf_qs.filter(shop=shop)
        if hasattr(Workflow, "is_active"):
            try:
                wf_qs = wf_qs.filter(is_active=True)
            except Exception:
                pass

        if q:
            wf_qs = wf_qs.filter(
                Q(name__icontains=q)
                | Q(description__icontains=q)
            )
        if workflow_filter:
            wf_qs = wf_qs.filter(name__icontains=workflow_filter)

        wf_qs = wf_qs.order_by("name")[:5]

        for wf in wf_qs:
            key = ("workflow", wf.id)
            if key in seen:
                continue
            seen.add(key)
            results.append(
                {
                    "id": wf.id,
                    "type": "workflow",
                    "label": getattr(wf, "name", "") or "Workflow",
                    "subtitle": getattr(wf, "description", "") or "",
                    "url": f"/workflows/{wf.id}/",
                }
            )

        # ==========================
        #   FUZZY FALLBACK (if no results)
        # ==========================
        raw_q = q.strip().lower()

        def add_fuzzy_results():
            fuzzy_results = []

            if not raw_q or len(raw_q) < 3:
                return []

            # ---- Customers ----
            cust_candidates = Customer.objects.all()
            if restrict_by_shop:
                cust_candidates = cust_candidates.filter(shop=shop)
            if hasattr(Customer, "updated_at"):
                cust_candidates = cust_candidates.order_by("-updated_at")[:100]
            else:
                cust_candidates = cust_candidates.order_by("-id")[:100]

            cust_labels = []
            cust_index = {}
            for c in cust_candidates:
                label = f"{c.first_name} {c.last_name}".strip() or (
                    c.email or c.company_name or f"Customer {c.id}"
                )
                label_l = label.strip()
                if not label_l:
                    continue
                cust_labels.append(label_l)
                cust_index[label_l] = c

            for match in difflib.get_close_matches(q, cust_labels, n=5, cutoff=0.45):
                c = cust_index[match]
                key = ("customer", c.id)
                if key in seen:
                    continue
                seen.add(key)
                ratio = SequenceMatcher(None, q.lower(), match.lower()).ratio()
                fuzzy_results.append(
                    {
                        "id": c.id,
                        "type": "customer",
                        "label": match,
                        "subtitle": c.email or c.company_name or "",
                        "url": f"/customers/{c.id}/",
                        "_fuzzy_score": int(ratio * 70),
                    }
                )

            # ---- Projects ----
            proj_candidates = Project.objects.all()
            if restrict_by_shop:
                proj_candidates = proj_candidates.filter(shop=shop)
            if hasattr(Project, "updated_at"):
                proj_candidates = proj_candidates.order_by("-updated_at")[:100]
            else:
                proj_candidates = proj_candidates.order_by("-id")[:100]

            proj_labels = []
            proj_index = {}
            for p in proj_candidates:
                label = (p.name or "").strip() or (
                    p.reference_code or f"Project {p.id}"
                )
                if not label:
                    continue
                proj_labels.append(label)
                proj_index[label] = p

            for match in difflib.get_close_matches(q, proj_labels, n=5, cutoff=0.45):
                p = proj_index[match]
                key = ("project", p.id)
                if key in seen:
                    continue
                seen.add(key)
                ratio = SequenceMatcher(None, q.lower(), match.lower()).ratio()
                subtitle_parts = []
                if getattr(p, "reference_code", None):
                    subtitle_parts.append(p.reference_code)
                if getattr(p, "status", None):
                    subtitle_parts.append(p.status)
                subtitle = " · ".join(subtitle_parts)
                fuzzy_results.append(
                    {
                        "id": p.id,
                        "type": "project",
                        "label": match,
                        "subtitle": subtitle,
                        "url": f"/projects/{p.id}/",
                        "_fuzzy_score": int(ratio * 70),
                    }
                )

            # ---- Inventory (Materials, Consumables, Equipment) ----
            def fuzzy_inventory(model_cls, prefix):
                local_results = []
                inv_candidates = model_cls.objects.all()
                if restrict_by_shop:
                    inv_candidates = inv_candidates.filter(shop=shop)
                inv_candidates = inv_candidates.order_by("-id")[:100]

                labels = []
                index = {}
                for it in inv_candidates:
                    label = (getattr(it, "name", "") or "").strip()
                    if not label:
                        continue
                    labels.append(label)
                    index[label] = it

                for match in difflib.get_close_matches(q, labels, n=5, cutoff=0.45):
                    it = index[match]
                    key = ("inventory", f"{prefix}-{it.id}")
                    if key in seen:
                        continue
                    seen.add(key)
                    ratio = SequenceMatcher(None, q.lower(), match.lower()).ratio()
                    local_results.append(
                        {
                            "id": it.id,
                            "type": "inventory",
                            "label": match,
                            "subtitle": getattr(it, "sku", "") or "",
                            "url": f"/inventory/{prefix}s/{it.id}/",
                            "_fuzzy_score": int(ratio * 60),
                        }
                    )
                return local_results

            fuzzy_results.extend(fuzzy_inventory(Material, "material"))
            fuzzy_results.extend(fuzzy_inventory(Consumable, "consumable"))
            fuzzy_results.extend(fuzzy_inventory(Equipment, "equipment"))

            # ---- Workflows ----
            wf_candidates = Workflow.objects.all()
            if restrict_by_shop:
                wf_candidates = wf_candidates.filter(shop=shop)
            wf_candidates = wf_candidates.order_by("name")[:100]

            wf_labels = []
            wf_index = {}
            for w in wf_candidates:
                label = (getattr(w, "name", "") or "").strip()
                if not label:
                    continue
                wf_labels.append(label)
                wf_index[label] = w

            for match in difflib.get_close_matches(q, wf_labels, n=5, cutoff=0.45):
                w = wf_index[match]
                key = ("workflow", w.id)
                if key in seen:
                    continue
                seen.add(key)
                ratio = SequenceMatcher(None, q.lower(), match.lower()).ratio()
                fuzzy_results.append(
                    {
                        "id": w.id,
                        "type": "workflow",
                        "label": match,
                        "subtitle": getattr(w, "description", "") or "",
                        "url": f"/workflows/{w.id}/",
                        "_fuzzy_score": int(ratio * 50),
                    }
                )

            return fuzzy_results

        # Only run fuzzy fallback if we have a base query and no normal matches
        if q and len(results) == 0:
            results.extend(add_fuzzy_results())

        # ==========================
        #      RELEVANCE SCORING
        # ==========================

        raw_q = q.strip().lower()

        def type_boost(item_type: str) -> int:
            """
            Prefer customers > projects > inventory > workflows
            so that people and active work float to the top.
            """
            return {
                "customer": 30,
                "project": 20,
                "inventory": 10,
                "workflow": 5,
            }.get((item_type or "").lower(), 0)

        def compute_score(item: dict) -> int:
            """
            Scoring:
              - exact label match: 100
              - startswith label: 80
              - contains in label: 60
              - contains in subtitle: 40
            plus:
              - type-based boost
              - any fuzzy bonus (_fuzzy_score)
            """
            base = 0
            label = (item.get("label") or "").lower()
            subtitle = (item.get("subtitle") or "").lower()
            t = item.get("type")

            if raw_q:
                if label == raw_q:
                    base = 100
                elif label.startswith(raw_q):
                    base = 80
                elif raw_q in label:
                    base = 60
                elif raw_q in subtitle:
                    base = 40
                else:
                    base = 0
            else:
                base = 0

            fuzzy_bonus = int(item.get("_fuzzy_score", 0))
            return base + type_boost(t) + fuzzy_bonus

        # Attach scores
        for item in results:
            item["_score"] = compute_score(item)

        # Sort by score descending
        results.sort(key=lambda r: r.get("_score", 0), reverse=True)

        # Cap to 15 before returning
        trimmed = results[:15]

        # Strip internal scoring fields before sending to client
        for item in trimmed:
            item.pop("_score", None)
            item.pop("_fuzzy_score", None)

        return Response(trimmed, status=200)

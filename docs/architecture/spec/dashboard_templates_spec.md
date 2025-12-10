# Makerfex – Dashboard Templates Specification (v1)

Dashboard Templates define the default card layouts for specific user roles or focuses.
They are *not personal dashboards*; they are defaults upon which users may build.

---

## 1. Template Structure (Conceptual)

A Dashboard Template includes:

| Field | Description |
|-------|-------------|
| `id` | Identifier for the template (e.g., `owner_exec_default`) |
| `name` | Human readable name |
| `ownerType` | `"ROLE"` or `"SYSTEM"` |
| `ownerId` | Role name if ownerType is ROLE |
| `layout` | Array of dashboard card instances |

Each card instance includes:

| Field | Description |
|-------|-------------|
| `instanceId` | Unique per dashboard |
| `cardId` | Points to a CardDefinition |
| `position` | A `{ x, y, w, h }` grid coordinate block |
| `overrides` | Optional custom settings (chartType, title, timeRange, hidden, etc.) |

---

## 2. Dashboard Templates (v1)

### A. Owner Executive Dashboard  
**id:** `owner_exec_default`  
**ownerType:** ROLE  
**ownerId:** OWNER  
**Purpose:** Financial overview + shop-wide health.

Cards included:
1. `pipeline_value_metric`
2. `revenue_trend`
3. `profit_margin_metric`
4. `wip_by_stage`
5. `project_throughput`
6. `at_risk_projects_table`

Example conceptual layout:

Row 0: [pipeline_value_metric][profit_margin_metric][active_projects_metric]
Row 1–2: [revenue_trend]
Row 3–4: [wip_by_stage] [project_throughput]
Row 5–6: [at_risk_projects_table]

---

### B. Maker "My Work" Dashboard  
**id:** `maker_my_work_default`  
**ownerType:** ROLE  
**ownerId:** MAKER  
**Purpose:** Prioritize daily tasks and personal workload.

Cards included:
1. `my_active_tasks_metric`
2. `my_due_today_metric`
3. `my_tasks_by_stage`
4. `my_task_queue`

Layout example:

Row 0: [my_active_tasks_metric][my_due_today_metric]
Row 1–2: [my_tasks_by_stage]
Row 3–5: [my_task_queue]


## 3. Future Extensions

- Managers may have `ops_default`
- Owners may have additional “financial deep dive” dashboards
- Users may duplicate templates to build personal dashboards
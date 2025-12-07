# Backend Modules Specification (v2 – with Products/Templates)

This document defines the responsibilities, key entities, and API surfaces for
each backend module. It is the contract that prevents cross-domain sprawl.

---

## 1. accounts

**Responsibility**

- Shops, users, employees, stations, and roles.

**Key Entities**

- `User`
  - Auth account, credentials, global identity.
- `Shop`
  - Logical tenant for all data; almost everything is shop-scoped.
- `Employee`
  - Belongs to a `Shop`.
  - Optionally linked to a `User` (if the employee has login access).
  - Can be used as a resource (even if no user).
- `Station`
  - Belongs to a `Shop`.
  - Represents a team/department/area (e.g., "Finishing", "Design").
  - Has many `Employees`.

**Notes**

- An employee may belong to multiple stations.
- Stations will be referenced by workflow stages and tasks.

**Example API**

- `GET /api/shops/`
- `GET /api/employees/`
- `POST /api/employees/`
- `GET /api/stations/`
- `POST /api/stations/`

---

## 2. customers

**Responsibility**

- Customer CRM: contact info, simple tags, and shop-level relationships.

**Key Entities**

- `Customer`
  - Belongs to a `Shop`.
  - Name, email, phone, address.
  - Tags (e.g., "wholesale", "VIP", "local market").

**Example API**

- `GET /api/customers/`
- `POST /api/customers/`
- `GET /api/customers/{id}/`

**Notes**

- `customers` does not own revenue; it reads from `sales` for customer totals.

---

## 3. workflows

**Responsibility**

- Describes reusable workflows that projects can adopt.

**Key Entities**

- `Workflow`
  - Belongs to a `Shop`.
  - Has many stages in a defined order.
- `WorkflowStage`
  - Belongs to a `Workflow`.
  - Name (e.g., "Design", "Cutting", "Finishing").
  - Order index.
  - Responsible `Station` (FK to accounts.Station).

**Notes**

- Workflows are templates only; actual active stages live in `projects`.
- Task templates are owned by stations (see `settings/config` or `tasks`).

**Example API**

- `GET /api/workflows/`
- `POST /api/workflows/`
- `GET /api/workflows/{id}/stages/`

---

## 4. projects

**Responsibility**

- Owns project lifecycle and high-level aggregates.
- Primary home for “what actually happened” on specific jobs.

**Key Entities**

- `Project`
  - Belongs to a `Shop`.
  - Belongs to a `Customer`.
  - References a `Workflow`.
  - Optional FK to `ProductTemplate` (if created from a template).
  - Name, description, pricing info (estimated price, estimated cost).
  - Status (e.g., draft, active, completed, cancelled).

- `ProjectStageInstance`
  - Belongs to a `Project`.
  - References a `WorkflowStage`.
  - Tracks: start date, end date, status (pending, in_progress, done).

- `ProjectNote`
  - Belongs to a `Project`.
  - Freeform text, optional attachments (future).

- `ProjectDesignDoc`
  - Belongs to a `Project`.
  - Stores reference to a file (path/key) and metadata (type, notes).

**Notes**

- Projects do **not** own tasks or time logs; they reference them via `tasks`.
- Projects do **not** own final sales numbers; they link to sales records.
- Projects are the primary source for real-world configurations that can be
  promoted into templates in the `products` module.

**Example API**

- `GET /api/projects/`
- `POST /api/projects/`
- `GET /api/projects/{id}/design-docs/`
- `POST /api/projects/{id}/design-docs/`
- `POST /api/projects/{id}/start/`
- `POST /api/projects/{id}/move_stage/`

---

## 5. tasks

**Responsibility**

- Fine-grained work items attached to projects and stages; canonical time tracking.

**Key Entities**

- `Task`
  - Belongs to a `Project`.
  - Belongs to a `ProjectStageInstance` or directly references a `WorkflowStage`.
  - Title, description, sequence/order.
  - Assignment:
    - `assignee_type`: "station" | "employee" | null
    - `assignee_station` (FK)
    - `assignee_employee` (FK)
  - Status: todo, in_progress, blocked, done.

- `TimeLog`
  - Belongs to a `Task`.
  - Optional `Employee` and `Station`.
  - Duration or start/end timestamps.
  - Used for analytics and cost estimation.

- (Optional) `TaskTemplate`
  - Belongs to a `Station` (via settings or tasks).
  - Defines default tasks used when a stage assigned to that station becomes active.

**Notes**

- Time tracking is canonical at the `Task` level.
- Station/Employee totals are derived via aggregation over logs.

**Example API**

- `GET /api/projects/{id}/tasks/`
- `POST /api/projects/{id}/tasks/`
- `POST /api/tasks/{id}/start/`
- `POST /api/tasks/{id}/complete/`
- `POST /api/tasks/{id}/log_time/`

---

## 6. inventory

**Responsibility**

- Track materials, consumables, equipment, and (eventually) usage.

**Key Entities**

- `Material`
  - Belongs to `Shop`.
  - Name, category, unit (board feet, sheets, liters, etc.).
  - Cost per unit, stock quantity (optional in v1).
- `Consumable`
  - Similar to Material but typically lower-cost items (glue, sandpaper).
- `Equipment`
  - Tools and machines; may have maintenance tracking later.

- (Future) `InventoryUsage`
  - Links `Project`/`Task` to `Material`/`Consumable` with quantity.

**Notes**

- Inventory should not dictate project behavior; it only records and reports.
- Consumption is a separate feature and can come later.
- The `products` module will use inventory entities to define BOMs.

**Example API**

- `GET /api/inventory/materials/`
- `POST /api/inventory/materials/`

---

## 7. products

**Responsibility**

- Reusable product templates created from real projects.
- Home of BOM recipes, reusable design docs, and default workflows for templated work.

**Key Entities**

- `ProductTemplate`
  - Belongs to a `Shop`.
  - Name, description.
  - Optional default `Workflow`.
  - Optional reference to the `Project` it was promoted from.
  - Optional default pricing guidance (e.g., suggested base price).

- `ProductBOMItem`
  - Belongs to `ProductTemplate`.
  - FK to `Material` or `Consumable` (inventory).
  - Quantity, unit, waste factor.

- `ProductEquipmentRequirement`
  - Belongs to `ProductTemplate`.
  - FK to `Equipment`.
  - Notes about usage (e.g., exclusive use, special setup).

- `ProductDesignDoc`
  - Belongs to `ProductTemplate`.
  - References a file (path/key).
  - Optional FK back to the originating `ProjectDesignDoc`.

**Notes**

- Product templates are **optional**:
  - Projects can be created from scratch with no template.
  - Projects can be created from a `ProductTemplate`, pre-filling BOM and workflow.
- A project can be **promoted** to a template:
  - Service lives in `products`:
    - `promote_project_to_template(project, options)`
  - Copies relevant BOM, equipment, and selected design docs.
- Standalone sales (e.g., craft fair stock items) can use `ProductTemplate` as the
  source of the line item description and BOM.

**Example API**

- `GET /api/products/templates/`
- `POST /api/products/templates/`
- `POST /api/projects/{id}/promote-to-template/`
- `GET /api/products/templates/{id}/design-docs/`

---

## 8. sales

**Responsibility**

- Canonical record of all sales and revenue.

**Key Entities**

- `Sale`
  - Belongs to a `Shop`.
  - Belongs to a `Customer`.
  - Optional FK to `Project` (for project-based custom work).
  - Totals: subtotal, tax, discount, total.
  - Status: draft, issued, paid, partially_paid, cancelled.
  - Optional fields: payment method, invoice number.

- `SaleLineItem`
  - Belongs to `Sale`.
  - Description.
  - Quantity.
  - Unit price.
  - Optional links:
    - `Project` (custom job)
    - `ProductTemplate` (standard product)
    - `InventoryItem` (if needed later)

**Notes**

- Sales supports both:
  - Project-based sales (custom commission).
  - Standalone sales (e.g., stock items for craft fairs).
- Customers, projects, and products **read from** sales for totals and history.

**Example API**

- `GET /api/sales/`
- `POST /api/sales/`
- `GET /api/customers/{id}/sales/`
- `GET /api/projects/{id}/sales/`
- `GET /api/products/templates/{id}/sales/` (optional)

---

## 9. analytics

**Responsibility**

- Read-only metrics and data for reporting and ML.

**Key Entities**

- `MetricSnapshot` (optional)
  - Cached values for dashboards.
- ML feature/label tables (implementation detail).

**Notes**

- Reads from `projects`, `tasks`, `inventory`, `products`, and `sales`.
- Does not own primary business data.
- Used by `assistants` and UI dashboards.

**Example API**

- `GET /api/analytics/overview/`
- `GET /api/analytics/projects/lead_time/`

---

## 10. assistants

**Responsibility**

- ML-backed wizards, estimators, and guided flows.

**Examples**

- Project time estimator:
  - Reads historical task/time data for similar workflows.
  - Suggests estimated durations and pricing.
- Workflow coach:
  - Suggests stage/task changes based on station workloads.
- Product template recommender:
  - Suggests templates based on past projects and customer types.

**Notes**

- Depends on `analytics` and other domains.
- No domain should depend on assistants to function.

---

## 11. settings / config

**Responsibility**

- Shop-level preferences and templates.

**Key Entities**

- `ShopSettings`
  - Timezone, currency, default hourly rate, etc.
- `StationTaskTemplate`
  - Belongs to `Station`.
  - Defines a sequence of default tasks to create when a stage owned by that station becomes active.

**Notes**

- This is where the "standard finish tasks" live.
- When a project enters a stage, a service orchestrates:
  - Stage belongs to Station X.
  - Station X has task templates.
  - Create `Task` instances for that project+stage.

---

## 12. Cross-Module Rules (No-Sprawl Contracts)

1. **Sales logic lives in `sales`**  
   - Projects store high-level estimated price/cost if needed.
   - Actual revenue is always read from `sales`.

2. **Task & time logic lives in `tasks`**  
   - Projects do not directly handle time logs.
   - Stations do not own time logs; they are derived from tasks.

3. **Workflows are templates, projects are instances**  
   - `workflows` has no knowledge of specific projects.
   - `projects` owns which stages are active and in which order for a given project.

4. **Assignments go through `tasks`**  
   - Stations and employees are assignment targets only.
   - No random "station_id" fields on unrelated models.

5. **Products own templates and BOMs**  
   - Projects can reference `ProductTemplate` but do not reimplement template logic.
   - Inventory entities are referenced by `products` for BOM, not the other way around.

6. **Analytics reads, does not write**  
   - If a new metric is needed, calculated fields or snapshots are introduced
     without changing core domains.

7. **Assistants orchestrate, never own data**  
   - They call into other modules but do not become a new source of truth.

8. **Promotions and cloning live in the target module**  
   - Example: project → product template promotion logic lives in `products`,
     not scattered across views/controllers.

---

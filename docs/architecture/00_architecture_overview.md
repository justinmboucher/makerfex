# Makerfex Architecture Overview (v2 – with Products/Templates)

Version: 1.1.0  
Status: Draft – architecture spine locked, implementation can evolve.

## 1. Product Intent

Makerfex is a shop-operations hub for makers and small fabrication shops.

Core promise:

> Use workflows, machine learning, and guided wizards to make running a shop
> (projects, tasks, time, inventory, sales) easier and smarter than generic
> project-management tools.

Primary target: shops with **1–5 employees**, but the system must scale up to
larger operations without needing a redesign.

V1 must support:

- Projects with stages and status
- Customers
- Inventory (materials, consumables, equipment)
- Workflows / templates
- Time tracking
- Basic financials (price, cost, profit)
- Tasks / subtasks
- Notes per project
- Employees and stations/departments
- Assignment by employee or station
- Sales tied to projects **and** standalone sales (e.g., craft fair items)
- Optional product templates for frequently repeated work
- Design documents that can be reused across projects/products

Machine learning and wizards sit on top of this domain model; they do not
replace it.

---

## 2. Architectural Principles

1. **Single source of truth per concept**  
   - Sales data must live in one canonical domain (`sales`), not partially in
     `projects` and partially in `customers`.
   - Project lifecycle logic lives in `projects`, not in random views or tasks.
   - Product recipes and reusable templates live in `products`, not sprinkled
     across projects or inventory.

2. **Strong modular boundaries (opinionated, level 10/10)**  
   - Each module has clear responsibilities and a limited dependency surface.
   - No "reach across" to grab foreign models and mutate them casually.
   - Cross-module operations go through services or APIs.

3. **Domain-first, framework-second**  
   - Modules are defined as business domains first (projects, workflows, sales,
     products), then implemented as Django apps or similar.

4. **Read-heavy analytics, write-light operational core**  
   - Operational domains own data.
   - Analytics / ML modules read from these domains, never become the source of
     truth.

5. **Extensible without rewrites**  
   - The same architecture should be comfortable for a solo maker and a
     multi-station shop.

---

## 3. Domain Map (Backend Modules)

These are conceptual domains; they will likely map 1:1 to backend apps.

- `accounts`  
  Shops, users, employees, stations/departments, roles.

- `customers`  
  Customer records, contact info, tagging/segmentation.

- `workflows`  
  Workflow templates and stages. Stages reference which station is responsible.

- `projects`  
  Projects, project-stage instances, project-level aggregates, project notes,
  project-level design docs.

- `tasks`  
  Task instances attached to projects and stages. Tasks can be assigned to a
  station or an employee. Owns time logs.

- `inventory`  
  Materials, consumables, equipment, and (eventually) stock tracking.

- `products` (new)  
  Reusable product templates created from real projects. Owns BOM recipes,
  equipment requirements, and reusable design docs for templated work.

- `sales`  
  Canonical sales/orders domain. Supports project-based sales and standalone
  sales (e.g., stock items). Owns line items and financials.

- `analytics`  
  Aggregated metrics, historical trends, ML features/labels, reports.

- `assistants`  
  Wizards, recommendations, and ML-backed helpers that orchestrate other
  domains (e.g., project estimators, workflow coaches).

- `settings` / `config`  
  Shop-level preferences, units, task templates, station defaults.

You do **not** have to implement all modules at once, but the architecture
assumes these boundaries.

---

## 4. High-Level Relationships

### Core Entities (simplified)

- `Shop` (accounts)
  - has many `Employees`
  - has many `Stations`
  - has many `Customers`
  - has many `Projects`
  - has many `ProductTemplates`
  - has many `InventoryItems`
  - has many `Sales`

- `Employee` (accounts)
  - optionally linked to a `User` (login)
  - belongs to a `Shop`
  - can belong to many `Stations`

- `Station` (accounts)
  - belongs to a `Shop`
  - has many `Employees`
  - has many `TaskTemplates` (via config/settings)
  - is referenced by `WorkflowStage` as the responsible party

- `Workflow` & `WorkflowStage` (workflows)
  - belong to a `Shop`
  - stages reference a `Station` as the responsible unit

- `Project` (projects)
  - belongs to a `Shop`
  - belongs to a `Customer`
  - references a `Workflow`
  - optionally references a `ProductTemplate` (if created from one)
  - has many `ProjectStageInstances`
  - has many `Tasks`
  - has many `ProjectDesignDocs`
  - may be linked to one or more `Sales` records

- `Task` (tasks)
  - belongs to a `Project`
  - belongs to a `ProjectStageInstance` or directly to a stage
  - assigned to either a `Station` or an `Employee`
  - has many `TimeLogs`

- `TimeLog` (tasks)
  - belongs to a `Task`
  - optionally linked to `Employee` and `Station`

- `InventoryItem` (inventory)
  - belongs to a `Shop`
  - may be linked to `Projects` or `Tasks` through usage records

- `ProductTemplate` (products)
  - belongs to a `Shop`
  - optional default `Workflow`
  - has many `ProductBOMItems`
  - has many `ProductEquipmentRequirements`
  - has many `ProductDesignDocs`
  - may reference the original `Project` it was promoted from

- `Sale` & `SaleLineItem` (sales)
  - belong to a `Shop`
  - belong to a `Customer`
  - optionally linked to a `Project`
  - canonical home of revenue amounts

- `ProjectDesignDoc` (projects)
  - belongs to a `Project`
  - references a file and metadata

- `ProductDesignDoc` (products)
  - belongs to a `ProductTemplate`
  - references a file and may reference the originating `ProjectDesignDoc`

---

## 5. Allowed Dependencies (Module-Level)

Think of this as a directed graph of "who is allowed to directly depend on whom".

- `accounts`  
  - can be used by any other domain (foundational).

- `customers`  
  - can depend on `accounts` (for shop ownership).
  - should not depend on downstream modules like `projects` or `sales`.

- `workflows`  
  - can depend on `accounts` (for stations / shop).
  - should not depend on `projects`, `tasks`, or `sales`.

- `inventory`  
  - can depend on `accounts`.
  - may be referenced by `products` for BOMs.
  - may be referenced by `projects`/`tasks` via usage logs, but **projects
    should not depend on inventory internals**.

- `projects`  
  - can depend on `accounts`, `customers`, `workflows`, and `products`
    (for the optional `product_template` FK).
  - can depend on `tasks` as a sibling module or treat tasks as a child domain.

- `tasks`  
  - can depend on `accounts` (employees, stations).
  - can depend on `projects` (owning project).

- `products`  
  - can depend on `accounts` (shop).
  - can depend on `inventory` (BOM items).
  - can depend on `workflows` (default workflow).
  - may store an optional reference back to the `Project` it was promoted from,
    but should not depend on project internals.

- `sales`  
  - can depend on `accounts` and `customers`.
  - can reference `projects` (e.g., sale.project_id) and `ProductTemplate`
    (e.g., line item describes a templated product).

- `analytics`  
  - can read from all operational modules (`projects`, `tasks`, `inventory`,
    `products`, `sales`, etc.).
  - should not be depended upon by them.

- `assistants`  
  - can orchestrate across modules and call APIs/services.
  - no module should depend on assistants to function.

- `settings` / `config`  
  - can depend on `accounts` (shop-level).
  - may provide configuration to `workflows`, `tasks`, `inventory`, etc.
  - should not depend on those modules.

### Diagram (simplified)

```text
[accounts] ----> [customers]
    |           [settings]
    |           [workflows]
    |           [inventory]
    |           [products]
    |           [projects] <---- [workflows]
    |               |
    |               v
    |            [tasks]
    |
    +----> [sales] <---- [customers]
                 ^
                 |
             [products] (line items may reference)

[analytics]  -> reads from everything
[assistants] -> orchestrates everything, no one depends on it
```

---

## 6. Layering

Within each module we use a simple layering:

- **Models / Entities**  
  - The actual persisted data structures.

- **Domain Services**  
  - Functions/classes that encapsulate business rules for that module.
  - Example: `projects.services.move_project_stage(project, new_stage)` or
    `products.services.promote_project_to_template(project)`.

- **API / Views / Serializers**  
  - Only talk to the domain services where possible.
  - Avoid embedding business rules in views.

Rule of thumb:

> Cross-domain operations should be implemented as "application services" that
> call into each domain, not by one domain poking directly into another's internals.

---

## 7. Assignment & Time Tracking Model

- Tasks can be assigned to:
  - a `Station`
  - an `Employee`
- Schema pattern (conceptual):

```text
Task
- assignee_type: "station" | "employee" | null
- assignee_station_id: nullable FK
- assignee_employee_id: nullable FK
```

- Time tracking is canonical at the **task level**:
  - Every `TimeLog` attaches to a `Task`.
  - Project-level and station-level time totals are derived from task logs.

This is critical for later ML estimators (time per task per station, etc.).

---

## 8. Sales Model (Canonical Truth)

- `sales` owns all monetary transaction records.
- Sales can be:
  - project-based (custom commission)
  - standalone (stock items, craft fair inventory, etc.)

Every other domain (projects, customers, analytics, products) **reads** sales data
instead of re-storing amounts.

---

## 9. Products & Template Promotion Model

### Projects-first, templates-second

- Projects are primary. Users can:
  - Create a project from scratch (no template).
  - Optionally start from an existing product template.
- At any point (often after successful completion), the user can:
  - "Promote project to product template".

### Promotion flow (conceptual)

1. User clicks "Save as template" on a project.
2. Service `products.services.promote_project_to_template(project)`:
   - Creates `ProductTemplate`.
   - Copies project BOM into `ProductBOMItems`.
   - Captures required equipment into `ProductEquipmentRequirements`.
   - Links default workflow (from the project).
   - Optionally selects and mirrors design docs into `ProductDesignDocs`.

### Design docs

- `ProjectDesignDoc`:
  - Primary home for design files (born from real work).
- `ProductDesignDoc`:
  - Mirrors selected project docs for future reuse.
  - Keeps optional FK to originating project design doc.

This keeps projects as the ground truth of "what actually happened" and
products as curated reusable recipes.

---

## 10. Extensibility Guidelines

1. New features should fit inside an existing module, or justify a new one.
2. If you find yourself copying logic across modules, consider a shared service
   or configuration in `settings`.
3. Do not add foreign-key spaghetti across domains; prefer:
   - Single FK back to the owner
   - Events or service calls for cross-module behavior
4. Frontend feature folders should mirror these backend domains.
5. Promotions (e.g., project → product template) should be encapsulated in
   services owned by the target module (`products`), not ad-hoc view logic.

---

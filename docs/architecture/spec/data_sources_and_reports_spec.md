# Makerfex – Data Sources & Reports Specification (v1 + roadmap)

This document defines how dashboard cards obtain their data, and how we will eventually
support user-defined reports that can drive dashboard panels.

The goal is to make dashboards talk to a generic **Data Source** abstraction, so that
v1 can use built-in metrics, and future versions can plug in user-created reports without
changing the card system.

---

## 1. Data Source Types

A Data Source is a conceptual origin of data for a card.

Two primary types:

1. `metric` – System-defined aggregates and statistics
   - Examples:
     - `financial.revenue_trend`
     - `projects.wip_by_stage`
     - `tasks.my_active_count`

2. `report` – Saved, user-defined report definitions (future)
   - Examples:
     - A report grouping projects by product type and month
     - A report summarizing material usage over time
     - A report listing all projects matching complex filters

v1 **only implements** `metric`.  
`report` is a planned extension.

---

## 2. CardDefinition and Data Sources

We extend the CardDefinition schema:

### Fields

- `dataSourceType`: `"metric" | "report"`
  - v1: always `"metric"`
- `dataSourceKey`: string
  - For metrics: a stable key such as `projects.wip_by_stage`
  - For reports (future): a report ID such as `rep_<uuid>`
- `dataSourceConfig` (optional): object
  - Default filters, grouping, or parameters for the data source

Example v1 metric-backed card:

```json
{
  "id": "wip_by_stage",
  "type": "chart",
  "dataSourceType": "metric",
  "dataSourceKey": "projects.wip_by_stage",
  "defaultChartType": "bar",
  "allowedChartTypes": ["bar", "area"],
  "requiredCapabilities": ["view_shop_aggregates"]
}
```

Example future report-backed card:

```json
{
  "id": "custom_report_chart",
  "type": "chart",
  "dataSourceType": "report",
  "dataSourceKey": "rep_4f3b2e...",
  "defaultChartType": "bar",
  "allowedChartTypes": ["bar", "line"],
  "requiredCapabilities": ["view_shop_aggregates"]
}
```

## 3. DashboardConfig and Data Sources

The DashboardConfig CardInstance can override the default data source, enabling
user-selected reports or custom filters in future versions.

```json
CardInstance (extended conceptual schema)
{
  "instanceId": "string",
  "cardId": "string",
  "position": { "x": 0, "y": 0, "w": 4, "h": 2 },
  "overrides": {
    "title": "optional",
    "chartType": "line | bar | area",
    "timeRange": "30d | 90d | custom",
    "hidden": false,

    "dataSourceType": "metric | report (optional override)",
    "dataSourceKey": "optional override key",
    "dataSourceConfig": { "filters": { ... } }
  }
}
```

v1 behavior:

- The frontend does not allow selecting data sources.

- All cards use their CardDefinition’s ```dataSourceType: "metric"``` and ```dataSourceKey```.

- ```dataSourceType```/```dataSourceKey``` in overrides remain unused.

v2+ behavior:

- Users can:

- - Choose a report they created to back a card.

- - OR create a new card instance specifically bound to a report.

- Those choices are stored in ```overrides.dataSourceType``` and ```overrides.dataSourceKey```.

## 4. Report Model (Future Roadmap)

In a future version, we introduce a Report model:

### Conceptual Report fields

- id: string/UUID

- shop: FK

- owner: FK (user)

- name: string

- sourceEntity: "projects" | "tasks" | "customers" | "inventory" | ..."

- filters: JSON

- groupBy: JSON (e.g., ["stage", "month"])

- aggregations: JSON (e.g., {"count": "*", "sum": "value"})

- outputShape: "table" | "series" (or both)

- created_at, updated_at

The report engine is responsible for converting this into a dataset suitable for:

- Tables (TableCard)

- Series-based charts (ChartCard / MetricCard)

## 5. API Layer
### v1 – Metrics-Only

- ```/api/dashboard/data/metric/<dataSourceKey>```
- - Returns aggregated data for system metrics.

### v2+ – Unified Data Source endpoint (optional refactor)

- /api/dashboard/data/

- Request:

- - dataSourceType

- - dataSourceKey

- - optional filters/params

- Backend dispatches:

- - If metric: call metric provider

- - If report: execute report definition

This keeps the frontend simple: cards always say, “get me data for this data source.”

## 6. Permissions & Reports

Reports must obey the same capability system:

- A report that references financial fields or entities:

- - Should require view_financials.

- The system should:

- - Prevent a user without view_financials from creating or viewing such reports.

- - Ensure report-backed cards still pass through backend permission checks.

## 7. Scope for v1

In v1 we will:

- Implement:

- - dataSourceType: "metric"

- - dataSourceKey for metrics

- Design:

- - CardDefinition and DashboardConfig with data source fields present

- Not implement yet:

- - Report creation UI

- - Report execution engine

- - dataSourceType: "report"

This allows v1 to ship with system-defined dashboards while laying a clean foundation
for user-defined reports and report-backed dashboard panels in a future version.
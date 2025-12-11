# Makerfex – Metrics & Data Sources API Specification (v1)

This document defines how dashboard **data sources** (v1: metrics) are exposed via the
backend API and how they map to the `dataSourceKey` values used in CardDefinitions.

---
## 1. High-level API Design

### 1.1 Data source types (v1)
In v1, we support only metrics:
- `dataSourceType: "metric"`

Each metric is identified by a `dataSourceKey`, such as:
- `financial.revenue_trend`
- `projects.wip_by_stage`
- `tasks.my_active_count`

### 1.2 REST structure
Recommended pattern:
GET /api/dashboard/data/metric/?key=<dataSourceKey>

---
## 2. Standard Response Envelope
```json
{
  "key": "projects.wip_by_stage",
  "dataSourceType": "metric",
  "meta": { "generatedAt": "2025-01-01T12:34:56Z", "shopId": 123, "timeRange": "30d" },
  "payload": {}
}
```
---
## 3. Metric Kinds & Payload Shapes

### 3.1 Single Value Metric
```json
{
  "kind": "single",
  "value": 42.0,
  "unit": "USD",
  "label": "Active projects",
  "comparison": { "value": 35.0, "period": "prev_30d", "delta": 7.0, "deltaPct": 0.2 }
}
```

### 3.2 Time Series
```json
{
  "kind": "time_series",
  "granularity": "day",
  "series": [
    { "id": "revenue", "label": "Revenue", "unit": "USD", "points": [
        { "t": "2025-01-01", "v": 1200.0 },
        { "t": "2025-01-02", "v": 800.0 } ] } ]
}
```

### 3.3 Categorical Series
```json
{
  "kind": "category_series",
  "categories": ["Design", "Build", "Finish", "Delivered"],
  "series": [ { "id": "count", "label": "Projects", "unit": "count", "values": [4,7,3,2] } ]
}
```

### 3.4 Table
```json
{
  "kind": "table",
  "columns": [
    { "key": "name", "label": "Project", "type": "string" },
    { "key": "customer", "label": "Customer", "type": "string" },
    { "key": "stage", "label": "Stage", "type": "string" },
    { "key": "due_date", "label": "Due", "type": "date" },
    { "key": "risk_score", "label": "Risk", "type": "number" } ],
  "rows": [
    { "id": 101, "name": "Custom Walnut Table", "customer": "Acme Co.",
      "stage": "Finish", "due_date": "2025-01-10", "risk_score": 0.82 } ]
}
```
---
## 4. Mappings: dataSourceKey → payload shape
- financial.pipeline_value → single
- financial.revenue_trend → time_series
- financial.profit_margin → single
- projects.active_count → single
- projects.overdue_count → single
- projects.wip_by_stage → category_series
- projects.throughput → time_series
- projects.at_risk_list → table
- tasks.my_active_count → single
- tasks.my_due_today → single
- tasks.my_wip_by_stage → category_series
- tasks.my_task_list → table
- shop.recent_activity → time_series
- customers.top_customers → table

---
## 5. Request Parameters
GET /api/dashboard/data/metric/?key=<dataSourceKey>&time_range=90d&granularity=week

---
## 6. Permissions
Backend must enforce capability requirements for each metric.

---
## 7. v1 Scope
- Implement /api/dashboard/data/metric/
- Support v1 dataSourceKeys and payload shapes
- Enforce permissions
- No report dataSources yet
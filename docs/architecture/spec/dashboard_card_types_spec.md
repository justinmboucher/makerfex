
# Dashboard Card Types Specification
Makerfex Dashboard System  
Detail Level: Comprehensive  
Tone: Makerfex‑Friendly Professional

---

## 1. Purpose & Context
This spec defines card types, metric payload kinds, and how CardDefinitions and CardInstances interact. It ensures consistency between backend analytics payloads and frontend renderers.

---

## 2. Core Concepts
### 2.1 CardDefinition
Reusable global definition including type, data source, visual defaults, and capability requirements.

### 2.2 CardInstance
Specific placement of a card within a dashboard layout with overrides.

### 2.3 DataSource
Describes how a card retrieves data, usually from `/api/analytics/metrics/`.

### 2.4 Visual Configuration
Presentation details (default title, preferred chart type).

---

## 3. CardDefinition Schema
```
{
  "id": "wip_by_stage",
  "type": "chart",
  "dataSource": {
    "kind": "metric",
    "metricKey": "projects.wip_by_stage",
    "defaultParams": { "time_range": "30d" }
  },
  "visual": {
    "defaultTitle": "WIP by Stage",
    "defaultChartType": "bar"
  },
  "requiredCapabilities": ["view_shop_aggregates"],
  "layoutDefaults": { "minGrid": {"w":2,"h":2} }
}
```

---

## 4. Card Types
### 4.1 Metric (`type: "metric"`)
Maps payload kinds:
- `single`
- `sparkline`

### 4.2 Chart (`type: "chart"`)
Maps payload kinds:
- `category_series`
- `time_series`

### 4.3 Table (`type: "table"`)
Maps payload kind:
- `table`

### 4.4 Custom (`type: "custom"`)
Extension category for future:
- Activity timelines
- Multi-metric composites

---

## 5. Metric Payload Kinds
### 5.1 `single`
For key KPIs. Includes:
- `value`
- `unit`
- `comparison`

### 5.2 `sparkline`
Same as `single` plus:
- `points`: small time series

### 5.3 `category_series`
Contains categories + numeric series for bar charts.

### 5.4 `time_series`
Timestamped points for line/area charts.

### 5.5 `table`
Columns + rows for tabular presentation.

---

## 6. DataSource Types
### 6.1 Analytics Metric
```
{ "kind": "metric", "metricKey": "...", "defaultParams": {...} }
```

Future support could include alternate APIs or local data models.

---

## 7. CardInstance vs CardDefinition
Definition provides:
- Type
- Source
- RequiredCapabilities
- Defaults

Instance provides:
- Layout positioning
- Overrides (title, timeRange)
- Visibility settings

---

## 8. Reuse Outside Dashboards
CardDefinitions may be consumed in:
- Project details side panels
- Customer insights
- Embedded analytics blocks

Controller logic remains consistent.

---

## 9. Adding New Card Types or Payload Kinds
High-level steps:
1. Add backend payload kind (analytics side)
2. Add component mapping in card controller
3. Write CardDefinitions using new type/kind
4. Update visual spec if necessary

---

## 10. Security & Permissions Integration
RequiredCapabilities must align with backend metric capabilities.  
If user lacks permissions:
- Card is hidden or replaced by permission-denied message.

---

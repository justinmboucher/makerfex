# Makerfex – Card Definitions Specification (v1)

This document defines the universal catalog of reusable dashboard cards used throughout
Makerfex. Card definitions describe *what a card is conceptually*, not how it is laid out
or which dashboard uses it.

---

## 1. Purpose

Card Definitions are the system-wide “lego bricks” for dashboards. Each card describes:

- What metric or dataset it represents  
- What chart types it supports  
- What permissions are required to view it  
- What frontend component type it maps to  
- What backend data source it consumes  

Card Definitions **do not** define positions, sizing, or user overrides.  
Those belong in Dashboard Configs.

---

## 2. CardDefinition Object Schema (Conceptual)

A CardDefinition has the following conceptual fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the card type |
| `type` | `"metric" | "chart" | "table"` | Determines base component (MetricCard, ChartCard, TableCard) |
| `dataSourceKey` | string | Key used to request backend metric data |
| `defaultChartType` | string or null | Default visualization method |
| `allowedChartTypes` | array | Whitelist of allowed chart types for user overrides |
| `requiredCapabilities` | array | Which backend permissions are needed to view this card |
| `defaultOptions` | object | Optional default settings (time ranges, grouping, etc.) |

---

## 3. Card Catalog (v1)

### A. Financial Cards (Owner/Admin)

#### `pipeline_value_metric`
- **type:** metric  
- **dataSourceKey:** `financial.pipeline_value`  
- **allowedChartTypes:** []  
- **requiredCapabilities:** `["view_financials"]`  

#### `revenue_trend`
- **type:** chart  
- **dataSourceKey:** `financial.revenue_trend`  
- **defaultChartType:** line  
- **allowedChartTypes:** line, bar, area  
- **requiredCapabilities:** `["view_financials"]`  

#### `profit_margin_metric`
- **type:** metric  
- **dataSourceKey:** `financial.profit_margin`  
- **requiredCapabilities:** `["view_financials"]`  

---

### B. Operations / Shop Cards

#### `active_projects_metric`
- **type:** metric  
- **dataSourceKey:** `projects.active_count`  
- **requiredCapabilities:** `["view_shop_aggregates"]`  

#### `overdue_projects_metric`
- **type:** metric  
- **dataSourceKey:** `projects.overdue_count`  
- **requiredCapabilities:** `["view_shop_aggregates"]`  

#### `wip_by_stage`
- **type:** chart  
- **dataSourceKey:** `projects.wip_by_stage`  
- **defaultChartType:** bar  
- **allowedChartTypes:** bar, area  
- **requiredCapabilities:** `["view_shop_aggregates"]`  

#### `project_throughput`
- **type:** chart  
- **dataSourceKey:** `projects.throughput`  
- **defaultChartType:** line  
- **allowedChartTypes:** line, bar, area  
- **requiredCapabilities:** `["view_shop_aggregates"]`  

#### `at_risk_projects_table`
- **type:** table  
- **dataSourceKey:** `projects.at_risk_list`  
- **requiredCapabilities:** `["view_shop_aggregates"]`  

---

### C. Maker / Employee Cards

#### `my_active_tasks_metric`
- **type:** metric  
- **dataSourceKey:** `tasks.my_active_count`  
- **requiredCapabilities:** `["view_my_work"]`  

#### `my_due_today_metric`
- **type:** metric  
- **dataSourceKey:** `tasks.my_due_today`  
- **requiredCapabilities:** `["view_my_work"]`  

#### `my_tasks_by_stage`
- **type:** chart  
- **dataSourceKey:** `tasks.my_wip_by_stage`  
- **defaultChartType:** bar  
- **allowedChartTypes:** bar, area  
- **requiredCapabilities:** `["view_my_work"]`  

#### `my_task_queue`
- **type:** table  
- **dataSourceKey:** `tasks.my_task_list`  
- **requiredCapabilities:** `["view_my_work"]`  

---

### D. Shared / General Cards

#### `shop_activity_recent`
- **type:** chart  
- **dataSourceKey:** `shop.recent_activity`  
- **defaultChartType:** line  
- **allowedChartTypes:** line, area  
- **requiredCapabilities:** `["view_shop_aggregates"]`  

#### `top_customers_table`
- **type:** table  
- **dataSourceKey:** `customers.top_customers`  
- **requiredCapabilities:** `["view_shop_aggregates"]`  

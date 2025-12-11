# Makerfex – Card Controller Specification (v1)

This document defines the Card Controller layer that sits between:

- CardDefinitions
- DashboardConfigs (CardInstances)
- Data source API (metrics for v1)
- Presentational card components (MetricCard, ChartCard, TableCard, DashboardCard)

The goal is to centralize data fetching, config merging, and payload transformation,
so individual card components remain presentational and reusable.

---
## 1. Responsibilities

The Card Controller is responsible for:

1. Accepting a CardDefinition and CardInstance from a dashboard layout
2. Merging definition and instance into an EffectiveCardConfig
3. Resolving dataSourceType, dataSourceKey, chart type, and overrides
4. Fetching metric data from the backend data source API
5. Mapping payloads into props for MetricCard, ChartCard, or TableCard
6. Handling loading and error states
7. Enforcing capability checks on the frontend (as a second line of defense)

The Controller is not responsible for:

- Layout positioning (x, y, w, h)
- Drag and drop behavior
- Global navigation or routing

---
## 2. Core Concepts and Types

### 2.1 CardDefinition (recap)

Conceptual shape (simplified):

```ts
type CardDefinition = {
  id: string;
  type: "metric" | "chart" | "table";
  dataSourceType: "metric" | "report"; // v1: "metric" only
  dataSourceKey: string;
  dataSourceConfig?: Record<string, any>;
  defaultChartType?: "line" | "bar" | "area" | "donut" | "radialBar";
  allowedChartTypes?: string[];
  requiredCapabilities: string[];
  defaultOptions?: Record<string, any>;
}
```

### 2.2 CardInstance (from DashboardConfig spec)

```ts
type CardInstance = {
  instanceId: string;
  cardId: string;
  position: { x: number; y: number; w: number; h: number };
  overrides?: {
    title?: string;
    chartType?: string;
    timeRange?: string;
    hidden?: boolean;
    dataSourceType?: "metric" | "report";
    dataSourceKey?: string;
    dataSourceConfig?: Record<string, any>;
  };
};
```

### 2.3 EffectiveCardConfig

The Card Controller merges CardDefinition and CardInstance into an EffectiveCardConfig:

```ts
type EffectiveCardConfig = {
  instanceId: string;
  cardId: string;

  // Visual meta
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: React.ReactNode; // optional, may be defined in definition or layout

  // Card and chart type
  cardType: "metric" | "chart" | "table";
  chartType?: "line" | "bar" | "area" | "donut" | "radialBar";

  // Data source
  dataSourceType: "metric" | "report";
  dataSourceKey: string;
  dataSourceConfig?: Record<string, any>;
  timeRange?: string;

  // Layout and behavior
  position: { x: number; y: number; w: number; h: number };
  hidden: boolean;

  // Permissions and capabilities
  requiredCapabilities: string[];
};
```

In v1, dataSourceType will always resolve to "metric".

---
## 3. High Level API of the Card Controller

The Controller can be implemented as a React component that takes an instance and
definition, and internally fetches data and chooses the correct presentational card.

### 3.1 Component Signature

```ts
type DashboardCardControllerProps = {
  definition: CardDefinition;
  instance: CardInstance;
  currentUserCapabilities: string[];
};

function DashboardCardController(props: DashboardCardControllerProps) {
  // implementation sketch
}
```

### 3.2 Internal Steps

The component should internally:

1. Build EffectiveCardConfig by merging definition and instance
2. Check required capabilities against currentUserCapabilities
3. If user lacks capabilities:
   - Render a restricted placeholder card
4. Otherwise, fetch data from the data source API
5. Based on payload.kind, map to appropriate card props
6. Render MetricCard, ChartCard, or TableCard inside a DashboardCard shell

---
## 4. EffectiveCardConfig Resolution Rules

The merge rules from CardDefinition and CardInstance are:

- `cardType`: from CardDefinition.type
- `chartType`:
  - From instance.overrides.chartType if present and allowed
  - Else from CardDefinition.defaultChartType
- `title`:
  - From instance.overrides.title if present
  - Else from CardDefinition or a lookup table
- `dataSourceType`:
  - From instance.overrides.dataSourceType if present
  - Else from CardDefinition.dataSourceType
- `dataSourceKey`:
  - From instance.overrides.dataSourceKey if present
  - Else from CardDefinition.dataSourceKey
- `dataSourceConfig`: merged shallow:
  - Base: CardDefinition.dataSourceConfig
  - Overridden by instance.overrides.dataSourceConfig
- `timeRange`:
  - From instance.overrides.timeRange if present
  - Else from a dashboard level default (e.g. 30d)
- `hidden`:
  - From instance.overrides.hidden or default false
- `requiredCapabilities`:
  - Directly from CardDefinition.requiredCapabilities

This process produces a ready to use EffectiveCardConfig for the controller.

---
## 5. Data Fetching Behavior

### 5.1 Metrics Endpoint Access

For v1, all dataSourceType values will be "metric" and the controller will call:

- `GET /api/dashboard/data/metric/?key=<dataSourceKey>&time_range=<timeRange>`

Additional query parameters may be added in future (such as granularity).

### 5.2 Loading States

- While awaiting response:
  - Render the chosen card type with isLoading set to true
- On success:
  - Render card with mapped props
- On error:
  - Render card with error set (and fallback messaging inside body)

---
## 6. Mapping Metric Payloads to Card Props

The controller interprets the `payload.kind` field and chooses how to map data:

### 6.1 Single Value Metric → MetricCard

Payload (from metrics_api_spec):

```json
{
  "kind": "single",
  "value": 42.0,
  "unit": "USD",
  "label": "Active projects",
  "comparison": {
    "value": 35.0,
    "period": "prev_30d",
    "delta": 7.0,
    "deltaPct": 0.2
  }
}
```

Mapping to MetricCardProps (conceptual):

```ts
MetricCardProps = {
  title: effectiveConfig.title ?? payload.label,
  value: payload.value,
  unit: payload.unit,
  trendDirection: inferTrendDirection(payload.comparison),
  trendDelta: payload.comparison?.deltaPct,
  trendLabel: "vs " + payload.comparison?.period,
};
```

### 6.2 Time Series → ChartCard (line or area)

Payload:

```json
{
  "kind": "time_series",
  "granularity": "day",
  "series": [
    { "id": "revenue", "label": "Revenue", "unit": "USD", "points": [
      { "t": "2025-01-01", "v": 1200.0 },
      { "t": "2025-01-02", "v": 800.0 }
    ] }
  ]
}
```

Mapping:

- Pick chartType according to EffectiveCardConfig.chartType (line or area)
- Use Apex theme utils to convert series into options and series arrays

```ts
const { options, series } = getLineOrAreaOptionsFromTimeSeries(payload, effectiveConfig);

ChartCardProps = {
  title: effectiveConfig.title,
  chartType: effectiveConfig.chartType,
  options,
  series,
};
```

### 6.3 Category Series → ChartCard (bar or area)

Payload:

```json
{
  "kind": "category_series",
  "categories": ["Design", "Build", "Finish"],
  "series": [
    { "id": "count", "label": "Projects", "values": [3, 5, 2] }
  ]
}
```

Mapping:

- Choose bar or area based on chartType preferences
- Use Apex bar or area builder utilities

### 6.4 Table → TableCard

Payload:

```json
{
  "kind": "table",
  "columns": [
    { "key": "name", "label": "Project", "type": "string" },
    { "key": "customer", "label": "Customer", "type": "string" }
  ],
  "rows": [
    { "id": 1, "name": "Custom Table", "customer": "Acme Co." }
  ]
}
```

Mapping:

- Directly pass columns and rows to TableCard
- Optionally adapt types into alignments or custom cell renderers

---
## 7. Permission Handling and Restricted Cards

Although the backend enforces capabilities, the controller should also:

- Check EffectiveCardConfig.requiredCapabilities against currentUserCapabilities
- If any capability is missing:
  - Skip the data fetch
  - Render a restricted view card that clearly indicates that data is not available

Conceptual restricted render:

```ts
if (!hasCapabilities(effective.requiredCapabilities, currentUserCapabilities)) {
  return (
    <DashboardCard title={effective.title}>
      <div className="card-restricted-message">
        You do not have access to this data.
      </div>
    </DashboardCard>
  );
}
```

---
## 8. Integration With Dashboard Layout

At a higher level, a Dashboard component will:

1. Load dashboard configuration (DashboardConfig) for the current user or role
2. Resolve CardDefinitions by cardId for each CardInstance
3. For each instance:
   - Render `<DashboardCardController definition={def} instance={inst} />`
4. Handle layout (grid) concerns outside the controller

This separation ensures that:

- Dashboard layout can change (including drag and drop)
- CardDefinitions can evolve
- DataSource implementation can change

without altering the Card Controller contract.

---
## 9. v1 Scope for Card Controller

In v1 the Card Controller will:

- Support dataSourceType = "metric" only
- Support the four payload kinds: single, time_series, category_series, table
- Use the metrics_api_spec endpoint
- Map results into MetricCard, ChartCard, and TableCard props
- Handle missing capabilities gracefully with restricted cards
- Delegate layout and drag and drop to higher level components

Not in v1:

- Support for dataSourceType = "report"
- In card editing or design UI
- Persisting user changes to CardInstance overrides

These will be layered on top of this controller spec in future versions.

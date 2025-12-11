# Makerfex – Dashboard Card Component API Specification (v1)

This document defines the React component API contracts for the reusable dashboard card
ecosystem used in Makerfex.

The goal is to ensure consistent layout, behavior, and styling across all dashboard
panels, while remaining compatible with:

- JSON-based dashboard configurations
- Data source abstraction (metrics now, reports later)
- Future drag-and-drop layout management

---

## 1. Overview of Card Component Types

We use four primary card components:

1. `DashboardCard` – Base shell (title, header actions, body, footer)
2. `MetricCard` – KPI / stat card, built on top of `DashboardCard`
3. `ChartCard` – Chart container using ApexCharts within a `DashboardCard`
4. `TableCard` – Data table container within a `DashboardCard`

All cards are **layout-agnostic** and **data-source-agnostic**:

- Layout (x, y, w, h) is handled at a higher level (dashboard layout component).
- Data fetching is handled by a higher-level “card controller” that passes props into
  these components.

---

## 2. Common Concepts

### 2.1 Card Size & Density

Cards should support a small set of abstract sizes:

- `size`: `"xs" | "sm" | "md" | "lg"`
- `density` (optional): `"comfortable" | "compact"`

These map to:
- Padding
- Minimum height
- Typography scale (slightly)

Exact CSS values live in the design system (tokens/theme).

---

### 2.2 Status / Tone

Cards can optionally reflect a semantic tone:

- `tone`: `"default" | "success" | "warning" | "danger" | "info"`

Used primarily for:
- MetricCards (e.g., overdue projects = warning)
- Subtle accent border or icon color

---

### 2.3 Loading / Error States

All card types should support:

- `isLoading`: boolean
- `error`: optional error object or string

Behavior:
- When `isLoading === true`:
  - Suppress primary content
  - Show skeleton or spinner.
- When `error` is present:
  - Show a non-crashy “error in card” message area inside the card body.

---

### 2.4 Header Actions

Cards can display optional actions in the header:

- `actions`: React node
  - Could be a button group, dropdown, icon buttons, etc.

Common use cases:
- Time range selection
- Chart type selector
- “View full report” link

---

## 3. `DashboardCard` (Base Shell)

`DashboardCard` is the atomic card layout component.

### 3.1 Responsibilities

- Render card frame (background, border, radius, shadow)
- Render header (title, subtitle, icon, actions)
- Render body (children)
- Render optional footer

### 3.2 Props (Conceptual API)

```ts
type DashboardCardProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;        // small label above title
  icon?: React.ReactNode;  // optional icon next to title

  size?: "xs" | "sm" | "md" | "lg";
  tone?: "default" | "success" | "warning" | "danger" | "info";

  isLoading?: boolean;
  error?: string | Error | null;

  actions?: React.ReactNode;  // header-right actions (buttons, menus)
  footer?: React.ReactNode;   // optional footer area

  className?: string;
  children?: React.ReactNode; // main content body
};
```

### 3.3 Behavior Notes
- When ```isLoading``` is true:

- - Show a loading skeleton in place of ```children```.

- When ```error``` is set:

- - Show an inline error message area inside the card body.

- When both ```footer``` and ```children``` are provided:

- - Footer appears as a distinct band at the bottom with smaller text.

```DashboardCard``` is dumb: it does not fetch data or interpret dashboard configs.

## 4. MetricCard
```MetricCard``` specializes ```DashboardCard``` for KPIs / summary stats.

### 4.1 Responsibilities
- Display a primary value (prominently)
- Display label and optional secondary metrics
- Optionally display a trend indicator (up/down/flat) and delta
- Optionally display a tiny inline sparkline (future)

### 4.2 Props (Conceptual API)
```ts
type TrendDirection = "up" | "down" | "flat";

type MetricCardProps = {
  // Base card props (subset that MetricCard supports/forwards)
  title?: string;           // Typically metric label, or we can derive from config
  subtitle?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  tone?: "default" | "success" | "warning" | "danger" | "info";
  isLoading?: boolean;
  error?: string | Error | null;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;

  // Metric-specific props
  value: number | string | null;
  valueFormat?: (value: number | string | null) => string;
  unit?: string;              // e.g., "$", "%", "hrs"
  secondaryValue?: number | string | null;
  secondaryLabel?: string;    // e.g., "Overdue"

  trendDirection?: TrendDirection;
  trendDelta?: number | null; // e.g., +12.5 (percentage points)
  trendLabel?: string;        // e.g., "vs last 30 days"

  // Sparkline (future-friendly)
  sparklineData?: number[];   // optional sparkline series
};
```

### 4.3 Behavior Notes
- MetricCard internally uses DashboardCard for frame/header/footer.
- If value is null or data is missing, show a graceful placeholder (“—”).
- If trendDirection is provided:
- - Show arrow icon (up, down, flat) and optional trendDelta with trendLabel.
- The caller (higher-level controller) is responsible for:
- - Fetching data
- - Formatting value / secondaryValue using valueFormat

## 5. ChartCard
ChartCard wraps an ApexCharts instance with a consistent card shell.

### 5.1 Responsibilities
- Provide a card shell with title, subtitle, actions.
- Reserve a defined chart area height based on size.
- Render the ApexChart component using props.
- Handle loading/error states.

### 5.2 Props (Conceptual API)
```ts
type ChartType = "line" | "bar" | "area" | "donut" | "radialBar" | "scatter";

type ChartCardProps = {
  // Base card props
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  tone?: "default" | "success" | "warning" | "danger" | "info";
  isLoading?: boolean;
  error?: string | Error | null;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;

  // Chart-specific props
  chartType: ChartType;
  options: any;   // ApexCharts options object
  series: any[];  // ApexCharts series data

  // Optional hints
  minHeight?: number; // override card's default height mapping for this size
};
```

### 5.3 Behavior Notes
- ChartCard does not decide what chart type is allowed. That comes from:
- - CardDefinition + DashboardConfig.
- The chart-type switcher UI (if any) should live outside ChartCard:
- - Usually in the actions area, managed by a higher-level container.
- ChartCard expects already-prepared options and series, formatted using a shared chart theme/util layer.

## 6. TableCard
TableCard hosts a table/grid within a consistent card shell.

### 6.1 Responsibilities
- Provide card shell and table container.
- Optionally render a mini-toolbar for table-level actions (search, filters).
- Handle loading/error states.

6.2 Props (Conceptual API)

```ts
type TableCardProps = {
  // Base card props
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";  // xs usually too small for tables
  tone?: "default" | "success" | "warning" | "danger" | "info";
  isLoading?: boolean;
  error?: string | Error | null;
  actions?: React.ReactNode;  // toolbar actions (e.g., filter dropdowns)
  footer?: React.ReactNode;
  className?: string;

  // Table content
  columns: Array<{
    key: string;
    label: string;
    width?: string | number;
    align?: "left" | "center" | "right";
    // additional column config fields as needed
  }>;
  rows: Array<Record<string, any>>;

  // Pagination / interaction (can be optional in v1)
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    onPageChange?: (page: number) => void;
  };

  onRowClick?: (row: any) => void;
};
```

### 6.3 Behavior Notes
- TableCard is intentionally generic:
- - It does not know about specific entities like projects or tasks.
- Higher-level containers adapt domain data (projects, tasks, customers) into the columns + rows shape.
- Pagination can be:
- - Controlled (callbacks provided), or
- - Omitted for simple static lists.

## 7. Higher-Level “Card Controller” Concept
At the top of the stack, there should be a Card Controller that:

1. Receives:
- - CardDefinition
- - CardInstance (from DashboardConfig)
2. Resolves:
- - Effective props (title, chartType, dataSource info, etc.)
3. Fetches data using:
- - dataSourceType
- - dataSourceKey
4. Transforms raw data into:
- - MetricCardProps, ChartCardProps, or TableCardProps
5. Renders the correct base component:
- - MetricCard, ChartCard, or TableCard

This separation ensures:

- Card components remain presentational.
- Data fetching and config merging logic stays centralized.
- It is easy to support new data sources (e.g., user-created reports) later.

## 8. v1 Scope
In v1, we will:

- Implement DashboardCard, MetricCard, ChartCard, and TableCard using this API.
- Implement a minimal Card Controller that:
- - Supports dataSourceType = "metric" only.
- - Reads from the v1 CardDefinitions and DashboardConfigs.
- Use a shared ApexCharts theme/util layer (defined in a separate spec) to build options + series for ChartCard.

We will **not** yet:

- Support dataSourceType = "report".
- Implement a full “card designer” UI.
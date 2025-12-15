// src/dashboard/cardDefinitions.js
// ============================================================================
// Dashboard Card Definitions
// ----------------------------------------------------------------------------
// This file is the *single source of truth* for what cards exist, what data
// they fetch, and how they are visually expressed across dashboards.
//
// Key concepts:
// - `type` controls which renderer is used (MetricCard, ChartCard, TableCard)
// - `dataSource.metricKey` maps directly to backend analytics keys
// - `visual` contains *purely presentational intent* (no data logic)
// - `tone` drives accent color (left strip, icons, trends)
// - `iconKey` maps to an icon shown in the metric card’s top-right
//
// IMPORTANT:
// - Dashboard pages should NEVER hardcode metric titles or logic.
// - All owner/employee dashboards should reference cards by ID only.
// - This enables layout changes without touching data or UI code.
// ============================================================================

export const cardDefinitions = {
  // --------------------------------------------------------------------------
  // LEFT KPI STACK (Owner Dashboard)
  // These are single-value metrics with optional sparklines.
  // They use MetricCard with:
  // - left accent strip
  // - in-card header
  // - large primary value
  // - trend + time comparison
  // - optional sparkline (right side)
  // --------------------------------------------------------------------------

  active_projects_metric: {
    id: "active_projects_metric",
    type: "metric",
    dataSource: {
      kind: "metric",
      metricKey: "projects.active_count",
      defaultParams: {},
    },
    visual: {
      defaultTitle: "Active projects",

      // `tone` controls:
      // - left border accent color
      // - trend arrow color
      // - icon background tint
      tone: "capacity",

      // `iconKey` is resolved by MetricCard → icon map
      // (purely visual; no semantic meaning)
      iconKey: "projects",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  // IMPORTANT:
  // Owner dashboard language must stay project-focused.
  // Even if backend data originates from tasks internally,
  // the UI narrative here is always *projects*.
  overdue_projects_metric: {
    id: "overdue_projects_metric",
    type: "metric",
    dataSource: {
      kind: "metric",
      metricKey: "projects.overdue_count",
      defaultParams: {},
    },
    visual: {
      defaultTitle: "Overdue projects",
      tone: "risk",
      iconKey: "risk",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  // Sparkline metric:
  // - Uses the same MetricCard renderer
  // - Backend payload.kind === "sparkline"
  // - Right-side sparkline visualizes same time range as trend comparison
  throughput_30d_sparkline: {
    id: "throughput_30d_sparkline",
    type: "metric",
    dataSource: {
      kind: "metric",
      metricKey: "projects.throughput_sparkline_30d",
      defaultParams: { time_range: "30d" },
    },
    visual: {
      defaultTitle: "Completed",
      tone: "trend",
      toneMode: "trend",            // ✅ NEW: makes strip/icon/sparkline follow good/bad
      trendGoodDirection: "up",     // ✅ NEW
      iconKey: "throughput",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  // --------------------------------------------------------------------------
  // HERO CHART
  // Large narrative visualization for the owner dashboard.
  //
  // Notes:
  // - This card intentionally avoids KPIs or trends
  // - Its job is to *tell a story*, not summarize performance
  // - Uses ChartCard with a category_series payload
  // --------------------------------------------------------------------------

  capacity_commitment_hero: {
    id: "capacity_commitment_hero",
    type: "chart",
    dataSource: {
      kind: "metric",
      metricKey: "projects.wip_by_stage",
      defaultParams: { time_range: "30d" },
    },
    visual: {
      defaultTitle: "Capacity & Commitment",
      defaultChartType: "bar",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  // --------------------------------------------------------------------------
  // Additional cards can be added here without touching:
  // - Dashboard layouts
  // - API wiring
  // - Rendering logic
  //
  // Just define:
  // - metricKey
  // - visual intent
  // - requiredCapabilities
  // --------------------------------------------------------------------------

  projects_flow_test_hero: {
    id: "projects_flow_test_hero",
    type: "chart",
    dataSource: {
      kind: "metric",
      // Special-cased in DashboardCardController (demo payload; no backend needed)
      metricKey: "demo.projects_flow",
      defaultParams: { time_range: "1y" },
    },
    visual: {
      defaultTitle: "Projects Overview",
      defaultChartType: "line", // mixed chart still renders via Apex; type is handled by series types
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

};

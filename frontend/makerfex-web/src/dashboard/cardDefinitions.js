// src/dashboard/cardDefinitions.js

// Central catalog of reusable card types.
// Each card definition is page-agnostic: dashboards, project list,
// customer detail, etc. all reference these by id.

export const cardDefinitions = {
  // --- Top metric tiles (dynamic) ---

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
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  overdue_tasks_metric: {
    id: "overdue_tasks_metric",
    type: "metric",
    dataSource: {
      kind: "metric",
      metricKey: "projects.overdue_count",
      defaultParams: {},
    },
    visual: {
      defaultTitle: "Overdue tasks",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  // Sparkline metric (completed projects)

  throughput_30d_sparkline: {
    id: "throughput_30d_sparkline",
    type: "metric",
    dataSource: {
      kind: "metric",
      metricKey: "projects.throughput_sparkline_30d",
      defaultParams: {
        time_range: "30d",
      },
    },
    visual: {
      defaultTitle: "Completed (last 30 days)",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  // --- Charts ---

  wip_by_stage: {
    id: "wip_by_stage",
    type: "chart",
    dataSource: {
      kind: "metric",
      metricKey: "projects.wip_by_stage",
      defaultParams: {
        time_range: "30d",
      },
    },
    visual: {
      defaultTitle: "WIP by stage",
      defaultChartType: "bar",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  throughput_30d: {
    id: "throughput_30d",
    type: "chart",
    dataSource: {
      kind: "metric",
      metricKey: "projects.throughput_30d",
      defaultParams: {
        time_range: "30d",
      },
    },
    visual: {
      defaultTitle: "Throughput (last 30 days)",
      defaultChartType: "line",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },

  // --- Tables ---

  top_overdue_projects: {
    id: "top_overdue_projects",
    type: "table",
    dataSource: {
      kind: "metric",
      metricKey: "projects.top_overdue",
      defaultParams: {
        time_range: "30d",
      },
    },
    visual: {
      defaultTitle: "Top overdue projects",
    },
    requiredCapabilities: ["view_shop_aggregates"],
  },
};

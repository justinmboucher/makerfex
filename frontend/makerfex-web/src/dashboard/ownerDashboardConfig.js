// src/dashboard/ownerDashboardConfig.js

// Minimal Slice A dashboard for shop owners

export const ownerExecDashboardConfig = {
  id: "owner_exec_default_slice_a",
  name: "Owner – Projects overview",
  ownerType: "ROLE",
  ownerId: "OWNER",
  layout: [
    {
      instanceId: "metric-active-projects",
      cardId: "active_projects_metric",
      position: { x: 0, y: 0, w: 2, h: 1 }
    },
    {
      instanceId: "metric-overdue-projects",
      cardId: "overdue_tasks_metric",
      position: { x: 2, y: 0, w: 2, h: 1 }
    },
    {
      instanceId: "wip-by-stage",
      cardId: "wip_by_stage",
      position: { x: 0, y: 1, w: 6, h: 3 },
      overrides: {},
    },
    {
      instanceId: "throughput-30d",
      cardId: "throughput_30d",
      position: { x: 0, y: 4, w: 6, h: 3 },
      overrides: {
        timeRange: "30d",
        chartType: "line",
      },
    },
    {
      instanceId: "top-overdue",
      cardId: "top_overdue_projects",
      position: { x: 0, y: 8, w: 6, h: 4 },
      overrides: {
        timeRange: "30d",
      },
    },
    {
      instanceId: "throughput-30d-sparkline",
      cardId: "throughput_30d_sparkline",
      position: { x: 0, y: 5, w: 3, h: 2 },
      overrides: {
        timeRange: "30d",
      },
    },
  ],
};

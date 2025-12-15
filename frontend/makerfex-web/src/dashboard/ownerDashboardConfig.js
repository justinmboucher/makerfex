// src/dashboard/ownerDashboardConfig.js
// Owner dashboard: time-first, capacity-first narrative.
// Revenue is contextual (handled in insight rail later).

export const ownerExecDashboardConfig = {
  id: "owner_exec_default",
  name: "Owner – Capacity & Commitment",
  ownerType: "ROLE",
  ownerId: "OWNER",

  // NOTE: We keep the existing "layout array" pattern so the current card system stays intact.
  // We add "slot" to support the canonical 3-column overview layout.
  layout: [
    // LEFT KPI STACK (urgency first)
    {
      instanceId: "kpi-active-projects",
      cardId: "active_projects_metric",
      slot: "left",
      position: { x: 0, y: 0, w: 2, h: 1 },
    },
    {
      instanceId: "kpi-overdue-projects",
      cardId: "overdue_projects_metric",
      slot: "left",
      position: { x: 0, y: 1, w: 2, h: 1 },
    },
    {
      instanceId: "kpi-throughput-sparkline",
      cardId: "throughput_30d_sparkline",
      slot: "left",
      position: { x: 0, y: 2, w: 2, h: 1 },
      overrides: { timeRange: "30d" },
    },

    // CENTER HERO (default focus: Capacity & Commitment)
    // Using your existing metric key for now to avoid backend guessing.
    {
      instanceId: "hero-capacity-commitment",
      cardId: "projects_flow_test_hero", // capacity_commitment_hero
      slot: "hero",
      position: { x: 2, y: 0, w: 6, h: 4 },
      overrides: { timeRange: "30d" },
    },
  ],
};

// src/pages/Dashboard.jsx
import React from "react";
import { PageShell, PageSection } from "../components/layout/PageShell";
import { MetricCard } from "../components/metrics/MetricCard";
import {
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  Activity,
} from "lucide-react";

import { cardDefinitions } from "../dashboard/cardDefinitions";
import { ownerExecDashboardConfig } from "../dashboard/ownerDashboardConfig";
import { DashboardCardController } from "../dashboard/DashboardCardController";

export function DashboardPage() {
  const layout = ownerExecDashboardConfig.layout;

  // TODO: replace with real capabilities from the authenticated user
  const currentUserCapabilities = ["view_shop_aggregates"];

  return (
    <PageShell
      title="Dashboard"
      subtitle="Silver Grain Woodworks"
      eyebrow="Overview"
      description="High-level snapshot of your shop’s health, work in progress, and recent activity."
      primaryAction={{
        label: "New project",
        onClick: () => console.log("TODO: open create project flow"),
      }}
    >
      {/* static metric row */}
      <PageSection className="mf-page-section--bare">
        <div className="dashboard-grid metrics-grid">
          {layout
            .filter((i) =>
              ["metric-active-projects", "metric-overdue-projects"].includes(i.instanceId)
            )
            .map((instance) => {
              const def = cardDefinitions[instance.cardId];
              return (
                <div key={instance.instanceId} className="dashboard-grid__item">
                  <DashboardCardController
                    definition={def}
                    instance={instance}
                    currentUserCapabilities={currentUserCapabilities}
                  />
                </div>
              );
            })}
        </div>
      </PageSection>

      {/* New: Live Slice A metrics driven by the backend */}
      <PageSection>
        <div className="mf-page-section__header">
          <div>
            <h2 className="mf-page-section__title">Live projects overview</h2>
            <p className="mf-page-section__subtitle">
              Active/overdue projects and WIP by stage, powered by your data.
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          {layout.map((instance) => {
            const def = cardDefinitions[instance.cardId];
            if (!def) return null;

            return (
              <div
                key={instance.instanceId}
                className="dashboard-grid__item"
              >
                <DashboardCardController
                  definition={def}
                  instance={instance}
                  currentUserCapabilities={currentUserCapabilities}
                />
              </div>
            );
          })}
        </div>
      </PageSection>

      {/* Later: another PageSection for recent projects, etc. */}
    </PageShell>
  );
}

export default DashboardPage;

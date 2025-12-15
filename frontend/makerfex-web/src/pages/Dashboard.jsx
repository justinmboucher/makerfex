// src/pages/Dashboard.jsx
import React from "react";
import { PageShell, PageSection } from "../components/layout/PageShell";
import { cardDefinitions } from "../dashboard/cardDefinitions";
import { ownerExecDashboardConfig } from "../dashboard/ownerDashboardConfig";
import { DashboardCardController } from "../dashboard/DashboardCardController";

import "../styles/pages/Dashboard.css";

/**
 * DashboardPage (Owner Overview)
 *
 * Owner dashboard route (/dashboard).
 * Handles:
 * - Owner overview layout: left KPI stack + center hero
 *
 * NOTE:
 * - The right insights drawer is layout-level (AppLayout), not owned by this page.
 * - Keep metric/card logic OUT of here — DashboardCardController handles it.
 */
export function DashboardPage() {
  const layout = ownerExecDashboardConfig.layout;

  // TODO: replace with real capabilities from the authenticated user
  const currentUserCapabilities = ["view_shop_aggregates"];

  const left = layout.filter((i) => i.slot === "left");
  const hero = layout.find((i) => i.slot === "hero");

  return (
    <PageShell title="Dashboard">
      {/* Use "bare" section so we can render our own single big panel */}
      <PageSection className="mf-page-section--bare">
        <div className="owner-dashboard-surface">
          <div className="owner-dashboard">
            {/* LEFT KPI STACK */}
            <div className="owner-dashboard__left">
              {left.map((instance) => {
                const def = cardDefinitions[instance.cardId];
                if (!def) return null;

                return (
                  <DashboardCardController
                    key={instance.instanceId}
                    definition={def}
                    instance={instance}
                    currentUserCapabilities={currentUserCapabilities}
                  />
                );
              })}
            </div>

            {/* CENTER HERO */}
            <div className="owner-dashboard__center">
              {hero ? (() => {
                const def = cardDefinitions[hero.cardId];
                if (!def) return null;

                return (
                  <DashboardCardController
                    key={hero.instanceId}
                    definition={def}
                    instance={hero}
                    currentUserCapabilities={currentUserCapabilities}
                  />
                );
              })() : null}
            </div>
          </div>
        </div>
      </PageSection>
    </PageShell>
  );
}

export default DashboardPage;

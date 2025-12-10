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

export function DashboardPage() {
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
      <PageSection className="mf-page-section--bare">
        <div className="mf-metric-grid">
          <MetricCard
            label="Active projects"
            value={12}
            secondaryLabel="In queue"
            secondaryValue="3 starting this week"
            trendLabel="vs last 30 days"
            trendValue="+4"
            trendDirection="up"
            icon={<Package size={16} />}
          />

          <MetricCard
            label="Avg. hourly rate"
            prefix="$"
            value="68"
            suffix="/hr"
            trendLabel="realized"
            trendValue="+$5"
            trendDirection="up"
            icon={<DollarSign size={16} />}
            tone="success"
          />

          <MetricCard
            label="Overdue tasks"
            value={7}
            trendLabel="past due"
            trendValue="+2"
            trendDirection="down"
            icon={<Clock size={16} />}
            tone="danger"
          />

          <MetricCard
            label="Monthly revenue (est.)"
            prefix="$"
            value="4.8k"
            trendLabel="projection"
            trendValue="+12%"
            trendDirection="up"
            icon={<TrendingUp size={16} />}
          />

          <MetricCard
            label="On-time completion"
            value="84%"
            trendLabel="last 30 days"
            trendValue="+6 pts"
            trendDirection="up"
            icon={<Activity size={16} />}
            tone="warning"
          />

          <MetricCard
            label="Shop capacity"
            value="72%"
            secondaryLabel="Next 14 days"
            secondaryValue="Moderate load"
            trendLabel="utilization"
            trendValue="+9 pts"
            trendDirection="up"
            icon={<Package size={16} />}
            tone="neutral"
          />
        </div>
      </PageSection>

      {/* Later: another PageSection for recent projects, etc. */}
    </PageShell>
  );
}

export default DashboardPage;

// src/dashboard/DashboardCardController.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

import { DashboardCard } from "../components/dashboard/DashboardCard";
import { MetricCard } from "../components/dashboard/MetricCard";
import { ChartCard } from "../components/dashboard/ChartCard";
import { TableCard } from "../components/dashboard/TableCard";

function hasCapabilities(requiredCaps = [], userCaps = []) {
  if (!requiredCaps.length) return true;
  if (!userCaps || !userCaps.length) return false;
  return requiredCaps.every((cap) => userCaps.includes(cap));
}

function buildEffectiveConfig(definition, instance) {
  const overrides = instance.overrides || {};
  const dataSourceDef = definition.dataSource || {};
  const visual = definition.visual || {};

  const cardType = definition.type;

  const chartType =
    overrides.chartType || visual.defaultChartType || undefined;

  const title =
    overrides.title || visual.defaultTitle || definition.id || "";

  const dataSourceKind =
    overrides.dataSourceKind || dataSourceDef.kind || "metric";

  const dataSourceKey =
    overrides.metricKey ||
    overrides.dataSourceKey ||
    dataSourceDef.metricKey ||
    dataSourceDef.key ||
    "";

  const dataSourceParams = {
    ...(dataSourceDef.defaultParams || {}),
    ...(overrides.dataSourceParams || {}),
  };

  const timeRange =
    overrides.timeRange ||
    dataSourceParams.time_range ||
    "30d";

  const hidden = !!overrides.hidden;

  return {
    instanceId: instance.instanceId,
    cardId: instance.cardId,
    cardType,
    chartType,
    title,
    dataSourceKind,
    dataSourceKey,
    dataSourceParams,
    timeRange,
    position: instance.position,
    hidden,
    requiredCapabilities: definition.requiredCapabilities || [],
  };
}

export function DashboardCardController({
  definition,
  instance,
  currentUserCapabilities,
}) {
  const effective = buildEffectiveConfig(definition, instance);

  const restricted = !hasCapabilities(
    effective.requiredCapabilities,
    currentUserCapabilities
  );

  const invalidDataSource =
    effective.dataSourceKind !== "metric" || !effective.dataSourceKey;

  const shouldFetch =
    !effective.hidden && !restricted && !invalidDataSource;

  const [state, setState] = useState(() => ({
    isLoading: shouldFetch,
    error: null,
    payload: null,
  }));

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    let cancelled = false;

    const params = {
      key: effective.dataSourceKey,
      time_range: effective.timeRange,
      ...(effective.dataSourceParams || {}),
    };

    axiosClient
      .get("/analytics/metrics/", { params })
      .then((res) => {
        if (cancelled) return;
        setState({
          isLoading: false,
          error: null,
          payload: res.data.payload,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          isLoading: false,
          error: err,
          payload: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    shouldFetch,
    effective.dataSourceKey,
    effective.timeRange,
    effective.dataSourceParams,
  ]);

  // --- Render branches that do NOT rely on useEffect state ---

  if (effective.hidden) {
    return null;
  }

  if (restricted) {
    return (
      <DashboardCard title={effective.title}>
        <div className="card-restricted-message">
          You do not have access to this data.
        </div>
      </DashboardCard>
    );
  }

  if (invalidDataSource) {
    return (
      <DashboardCard title={effective.title}>
        <div className="card-error-message">
          Invalid or unsupported data source.
        </div>
      </DashboardCard>
    );
  }

  // --- Normal async-driven branches ---

  const { isLoading, error, payload } = state;

  if (!payload && isLoading) {
    return <DashboardCard title={effective.title} isLoading />;
  }

  if (error && !isLoading) {
    return (
      <DashboardCard title={effective.title} error={error}>
        <div className="card-error-message">Unable to load this metric.</div>
      </DashboardCard>
    );
  }

  if (!payload) {
    return (
      <DashboardCard title={effective.title}>
        <div className="card-empty-message">No data available.</div>
      </DashboardCard>
    );
  }

  // kind: "single" → MetricCard
  if (payload.kind === "single" && effective.cardType === "metric") {
    const { value, unit, label, comparison } = payload;

    const trendDeltaPct = comparison?.deltaPct ?? null;
    let trendDirection = null;
    if (typeof trendDeltaPct === "number") {
      if (trendDeltaPct > 0.001) trendDirection = "up";
      else if (trendDeltaPct < -0.001) trendDirection = "down";
      else trendDirection = "flat";
    }

    return (
      <MetricCard
        title={effective.title || label}
        value={value}
        unit={unit}
        trendDirection={trendDirection}
        trendDelta={trendDeltaPct}
        trendLabel={comparison?.period ? `vs ${comparison.period}` : null}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // kind: "sparkline" → MetricCard with inline sparkline
  if (payload.kind === "sparkline" && effective.cardType === "metric") {
    const { value, unit, label, points, trendPct } = payload;

    let trendDirection = null;
    if (typeof trendPct === "number") {
      if (trendPct > 0.001) trendDirection = "up";
      else if (trendPct < -0.001) trendDirection = "down";
      else trendDirection = "flat";
    }

    return (
      <MetricCard
        title={effective.title || label}
        value={value}
        unit={unit}
        trendDirection={trendDirection}
        trendDelta={trendPct}
        trendLabel="vs period start"
        sparklinePoints={points}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // kind: "category_series" → ChartCard (bar)
  if (payload.kind === "category_series" && effective.cardType === "chart") {
    const categories = payload.categories || [];
    const seriesData = payload.series || [];

    const options = {
      chart: {
        id: effective.instanceId,
        toolbar: { show: false },
        background: "transparent",
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: "40%",
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ["var(--mf-color-text-primary)"],
        },
      },
      grid: {
        borderColor: "var(--mf-color-border-subtle)",
        strokeDashArray: 3,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: "var(--mf-color-text-muted)",
            fontSize: "11px",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: "var(--mf-color-text-muted)",
            fontSize: "11px",
          },
        },
      },
      tooltip: {
        theme: "dark",
      },
      colors: ["var(--mf-color-accent)"],
    };

    const series = seriesData.map((s) => ({
      name: s.label,
      data: s.values,
    }));

    return (
      <ChartCard
        title={effective.title}
        chartType={effective.chartType || "bar"}
        options={options}
        series={series}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // kind: "time_series" → ChartCard (line/area)
  if (payload.kind === "time_series" && effective.cardType === "chart") {
    const seriesData = payload.series || [];

    const series = seriesData.map((s) => ({
      name: s.label,
      data: (s.points || []).map((pt) => ({
        x: pt.t,
        y: pt.v,
      })),
    }));

    const options = {
      chart: {
        id: effective.instanceId,
        toolbar: { show: false },
        background: "transparent",
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        borderColor: "var(--mf-color-border-subtle)",
        strokeDashArray: 3,
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: {
            colors: "var(--mf-color-text-muted)",
            fontSize: "11px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "var(--mf-color-text-muted)",
            fontSize: "11px",
          },
        },
      },
      tooltip: {
        theme: "dark",
      },
      colors: ["var(--mf-color-accent)"],
    };

    return (
      <ChartCard
        title={effective.title}
        chartType={effective.chartType || "line"}
        options={options}
        series={series}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // kind: "table" → TableCard
  if (payload.kind === "table" && effective.cardType === "table") {
    const columns = payload.columns || [];
    const rows = payload.rows || [];

    return (
      <TableCard
        title={effective.title}
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // Fallback
  return (
    <DashboardCard title={effective.title}>
      <div className="card-empty-message">
        Unsupported payload kind for this card.
      </div>
    </DashboardCard>
  );
}

// src/dashboard/DashboardCardController.jsx
import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";

import { DashboardCard } from "../components/dashboard/DashboardCard";
import { MetricCard } from "../components/dashboard/MetricCard";
import { ChartCard } from "../components/dashboard/ChartCard";
import { TableCard } from "../components/dashboard/TableCard";

import {
  Briefcase,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Layers,
  Package,
  DollarSign,
} from "lucide-react";

/**
 * DashboardCardController
 *
 * - merges definition + instance into an effective config
 * - enforces requiredCapabilities
 * - fetches /analytics/metrics/ when needed
 * - renders MetricCard / ChartCard / TableCard depending on payload.kind
 *
 * Demo mode:
 * - metricKey starting with "demo." returns deterministic demo payloads
 *   for styling/testing without backend wiring.
 */

function hasCapabilities(requiredCaps = [], userCaps = []) {
  if (!requiredCaps.length) return true;
  if (!userCaps || !userCaps.length) return false;
  return requiredCaps.every((cap) => userCaps.includes(cap));
}

function stripApexFormatters(options) {
  const o = options || {};

  if (o.xaxis?.labels?.formatter) {
    o.xaxis.labels = { ...(o.xaxis.labels || {}) };
    delete o.xaxis.labels.formatter;
  }

  if (Array.isArray(o.yaxis)) {
    o.yaxis = o.yaxis.map((y) => {
      const yy = { ...(y || {}) };
      if (yy.labels?.formatter) {
        yy.labels = { ...(yy.labels || {}) };
        delete yy.labels.formatter;
      }
      return yy;
    });
  } else if (o.yaxis?.labels?.formatter) {
    o.yaxis.labels = { ...(o.yaxis.labels || {}) };
    delete o.yaxis.labels.formatter;
  }

  return o;
}

function buildEffectiveConfig(definition, instance) {
  const overrides = instance?.overrides || {};
  const dataSourceDef = definition?.dataSource || {};
  const visual = definition?.visual || {};

  const cardType = definition?.type;
  const chartType = overrides.chartType || visual.defaultChartType || undefined;
  const title = overrides.title || visual.defaultTitle || definition?.id || "";

  const dataSourceKind = overrides.dataSourceKind || dataSourceDef.kind || "metric";

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

  const timeRange = overrides.timeRange || dataSourceParams.time_range || "30d";
  const hidden = !!overrides.hidden;

  // ✅ trend semantics (must be returned so controller can use them)
  const toneMode = visual.toneMode || "static"; // "static" | "trend"
  const trendGoodDirection = visual.trendGoodDirection || "up"; // "up" | "down"

  return {
    instanceId: instance?.instanceId,
    cardId: instance?.cardId,
    cardType,
    chartType,
    title,
    dataSourceKind,
    dataSourceKey,
    dataSourceParams,
    timeRange,
    hidden,
    requiredCapabilities: definition?.requiredCapabilities || [],
    visualTone: visual?.tone || "neutral",
    iconKey: visual?.iconKey || null,

    // ✅ include these
    toneMode,
    trendGoodDirection,
  };
}

function normalizeCategorySeriesPayload(payload) {
  const categories = Array.isArray(payload?.categories)
    ? payload.categories
    : Array.isArray(payload?.labels)
      ? payload.labels
      : [];

  const rawSeries = Array.isArray(payload?.series) ? payload.series : [];

  const series = rawSeries.map((s, idx) => {
    const values = Array.isArray(s?.values)
      ? s.values
      : Array.isArray(s?.data)
        ? s.data
        : [];

    return {
      name: s?.label ?? s?.name ?? `Series ${idx + 1}`,
      data: values,
      type: s?.type, // "bar" | "line" optional
    };
  });

  return { categories, series };
}

// --------- timeframe helpers ---------
const TF_OPTIONS = ["Day", "Week", "Month", "Year"];

function timeRangeToTimeframeLabel(timeRange) {
  switch (timeRange) {
    case "1d":
      return "Day";
    case "7d":
      return "Week";
    case "30d":
      return "Month";
    case "1y":
      return "Year";
    default:
      return "Month";
  }
}

function timeframeLabelToTimeRange(label) {
  switch (label) {
    case "Day":
      return "1d";
    case "Week":
      return "7d";
    case "Month":
      return "30d";
    case "Year":
      return "1y";
    default:
      return "30d";
  }
}

// --------- icon mapping for MetricCard ---------
function iconFromKey(iconKey) {
  switch (iconKey) {
    case "projects":
      return <Briefcase size={18} />;
    case "risk":
      return <AlertTriangle size={18} />;
    case "throughput":
      return <TrendingUp size={18} />;
    case "success":
      return <CheckCircle2 size={18} />;
    case "inventory":
      return <Package size={18} />;
    case "layers":
      return <Layers size={18} />;
    case "revenue":
      return <DollarSign size={18} />;
    default:
      return null;
  }
}

/**
 * Demo payloads per timeframe for UI testing.
 * Key: demo.projects_flow
 */
function buildDemoPayload(metricKey, timeRange) {
  if (metricKey !== "demo.projects_flow") return null;

  if (timeRange === "1d") {
    const categories = ["8a", "10a", "12p", "2p", "4p", "6p"];
    const active = [6, 8, 7, 9, 8, 7];
    const completed = [1, 2, 1, 2, 1, 2];
    const cancelled = [0, 0, 1, 0, 0, 1];
    return {
      kind: "category_series",
      categories,
      series: [
        { label: "Active Projects", values: active, type: "bar" },
        { label: "Completed Projects", values: completed, type: "bar" },
        { label: "Cancelled Projects", values: cancelled, type: "line" },
      ],
    };
  }

  if (timeRange === "7d") {
    const categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const active = [18, 20, 19, 22, 21, 17, 16];
    const completed = [7, 6, 8, 7, 9, 5, 4];
    const cancelled = [1, 1, 2, 1, 1, 2, 1];
    return {
      kind: "category_series",
      categories,
      series: [
        { label: "Active Projects", values: active, type: "bar" },
        { label: "Completed Projects", values: completed, type: "bar" },
        { label: "Cancelled Projects", values: cancelled, type: "line" },
      ],
    };
  }

  if (timeRange === "1y") {
    const categories = ["Q1", "Q2", "Q3", "Q4"];
    const active = [62, 71, 66, 59];
    const completed = [28, 31, 33, 29];
    const cancelled = [6, 5, 7, 4];
    return {
      kind: "category_series",
      categories,
      series: [
        { label: "Active Projects", values: active, type: "bar" },
        { label: "Completed Projects", values: completed, type: "bar" },
        { label: "Cancelled Projects", values: cancelled, type: "line" },
      ],
    };
  }

  // default: "30d"
  const categories = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const active =     [18, 22, 17, 19, 24, 16, 20, 26, 15, 21, 19, 14];
  const completed =  [ 8,  6, 12, 11,  7, 10,  9,  8, 10,  7, 12,  9];
  const cancelled =  [ 2,  1,  3,  2,  2,  4,  1,  2,  3,  2,  2,  1];

  return {
    kind: "category_series",
    categories,
    series: [
      { label: "Active Projects", values: active, type: "bar" },
      { label: "Completed Projects", values: completed, type: "bar" },
      { label: "Cancelled Projects", values: cancelled, type: "line" },
    ],
  };
}

export function DashboardCardController({ definition, instance, currentUserCapabilities }) {
  const effective = useMemo(() => buildEffectiveConfig(definition, instance), [definition, instance]);

  const restricted = useMemo(
    () => !hasCapabilities(effective.requiredCapabilities, currentUserCapabilities),
    [effective.requiredCapabilities, currentUserCapabilities]
  );

  const invalidDataSource = useMemo(
    () => effective.dataSourceKind !== "metric" || !effective.dataSourceKey,
    [effective.dataSourceKind, effective.dataSourceKey]
  );

  const isDemo = useMemo(
    () => (effective.dataSourceKey || "").startsWith("demo."),
    [effective.dataSourceKey]
  );

  const shouldFetch = useMemo(
    () => !effective.hidden && !restricted && !invalidDataSource && !isDemo,
    [effective.hidden, restricted, invalidDataSource, isDemo]
  );

  // ---- Timeframe state (for charts) ----
  const initialTf = useMemo(
    () => timeRangeToTimeframeLabel(effective.timeRange),
    // seed once per card identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effective.instanceId]
  );

  const [activeTimeframe, setActiveTimeframe] = useState(initialTf);

  const activeTimeRange = useMemo(
    () => timeframeLabelToTimeRange(activeTimeframe),
    [activeTimeframe]
  );

  const paramsKey = useMemo(
    () => JSON.stringify(effective.dataSourceParams || {}),
    [effective.dataSourceParams]
  );

  const requestKey = useMemo(() => {
    return `${effective.dataSourceKey}::${activeTimeRange}::${paramsKey}`;
  }, [effective.dataSourceKey, activeTimeRange, paramsKey]);

  const [state, setState] = useState(() => ({
    requestKey: null,
    isLoading: false,
    error: null,
    payload: null,
  }));

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;

    setState((prev) => {
      if (prev.isLoading && prev.requestKey === requestKey) return prev;
      return { ...prev, requestKey, isLoading: true, error: null };
    });

    const params = {
      key: effective.dataSourceKey,
      time_range: activeTimeRange,
      ...(effective.dataSourceParams || {}),
    };

    axiosClient
      .get("/analytics/metrics/", { params })
      .then((res) => {
        if (cancelled) return;
        setState({
          requestKey,
          isLoading: false,
          error: null,
          payload: res?.data?.payload ?? null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          requestKey,
          isLoading: false,
          error: err,
          payload: null,
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch, requestKey]);

  // --- Render branches ---
  if (effective.hidden) return null;

  if (restricted) {
    return (
      <DashboardCard title={effective.title}>
        <div className="card-restricted-message">You do not have access to this data.</div>
      </DashboardCard>
    );
  }

  if (invalidDataSource) {
    return (
      <DashboardCard title={effective.title}>
        <div className="card-error-message">Invalid or unsupported data source.</div>
      </DashboardCard>
    );
  }

  const demoPayload = isDemo ? buildDemoPayload(effective.dataSourceKey, activeTimeRange) : null;
  const payload = demoPayload || state.payload;
  const isLoading = demoPayload ? false : (shouldFetch ? state.isLoading : false);
  const error = demoPayload ? null : state.error;

  if (!payload && isLoading) return <DashboardCard title={effective.title} isLoading />;

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

  // ----------------------
  // METRIC: kind === single
  // ----------------------
  if (payload.kind === "single" && effective.cardType === "metric") {
    const { value, unit, label, comparison } = payload;

    const trendDeltaPct = comparison?.deltaPct ?? null;
    let trendDirection = null;
    if (typeof trendDeltaPct === "number") {
      if (trendDeltaPct > 0.001) trendDirection = "up";
      else if (trendDeltaPct < -0.001) trendDirection = "down";
      else trendDirection = "flat";
    }

    // optional: let tone follow trend semantics too, if you want it for single metrics later
    const trendIsGood =
      !trendDirection || trendDirection === "flat"
        ? null
        : trendDirection === effective.trendGoodDirection;

    const toneForCard =
      effective.toneMode === "trend" && trendIsGood != null
        ? (trendIsGood ? "success" : "risk")
        : effective.visualTone;

    return (
      <MetricCard
        title={effective.title || label}
        value={value}
        unit={unit}
        tone={toneForCard}
        icon={iconFromKey(effective.iconKey)}
        trendDirection={trendDirection}
        trendDelta={trendDeltaPct}
        trendDeltaIsPct={false}
        trendTimeframe={comparison?.period ? `vs ${comparison.period}` : "this period"}
        trendGoodDirection={effective.trendGoodDirection}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // --------------------------
  // METRIC: kind === sparkline
  // --------------------------
  if (payload.kind === "sparkline" && effective.cardType === "metric") {
    const { value, unit, label, points, trendPct } = payload;

    let trendDirection = null;
    if (typeof trendPct === "number") {
      if (trendPct > 0.001) trendDirection = "up";
      else if (trendPct < -0.001) trendDirection = "down";
      else trendDirection = "flat";
    }

    const trendIsGood =
      !trendDirection || trendDirection === "flat"
        ? null
        : trendDirection === effective.trendGoodDirection;

    const toneForCard =
      effective.toneMode === "trend" && trendIsGood != null
        ? (trendIsGood ? "success" : "risk")
        : effective.visualTone;

    return (
      <MetricCard
        title={effective.title || label}
        value={value}
        unit={unit}
        tone={toneForCard}
        icon={iconFromKey(effective.iconKey)}
        trendDirection={trendDirection}
        trendDelta={trendPct}
        trendDeltaIsPct={false}
        trendTimeframe="vs period start"
        sparklinePoints={points}
        trendGoodDirection={effective.trendGoodDirection}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // -----------------------------------------
  // CHART: kind === category_series (mixed OK)
  // -----------------------------------------
  if (payload.kind === "category_series" && effective.cardType === "chart") {
    const { categories, series } = normalizeCategorySeriesPayload(payload);

    const mixedSeries = series.map((s) => ({
      name: s.name,
      data: s.data,
      type: s.type || "bar",
    }));

    const options = stripApexFormatters({
      chart: {
        id: effective.instanceId,
        toolbar: { show: false },
        background: "transparent",
        stacked: false,
      },
      stroke: {
        curve: "smooth",
        width: mixedSeries.map((s) => (s.type === "line" ? 3 : 0)),
      },
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: "42%" },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: "var(--mf-color-border-subtle)",
        strokeDashArray: 3,
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: Array(categories.length).fill("var(--mf-color-text-secondary)"),
            fontSize: "11px",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: ["var(--mf-color-text-secondary)"],
            fontSize: "11px",
          },
        },
      },
      tooltip: { theme: "dark" },
    });

    const totals = mixedSeries.map((s) => ({
      label: s.name,
      value: Array.isArray(s.data) ? s.data.reduce((acc, v) => acc + (Number(v) || 0), 0) : 0,
    }));

    return (
      <ChartCard
        title={effective.title}
        chartType={"line"}
        options={options}
        series={mixedSeries}
        isLoading={isLoading}
        error={error}
        timeframeOptions={TF_OPTIONS}
        activeTimeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
        showFooterTotals
        footerOverride={totals}
      />
    );
  }

  // -----------------------------
  // CHART: kind === time_series
  // -----------------------------
  if (payload.kind === "time_series" && effective.cardType === "chart") {
    const seriesData = Array.isArray(payload.series) ? payload.series : [];

    const series = seriesData.map((s, idx) => ({
      name: s?.label ?? s?.name ?? `Series ${idx + 1}`,
      data: (s?.points || []).map((pt) => ({ x: pt.t, y: pt.v })),
    }));

    const options = stripApexFormatters({
      chart: {
        id: effective.instanceId,
        toolbar: { show: false },
        background: "transparent",
      },
      stroke: { curve: "smooth", width: 2 },
      dataLabels: { enabled: false },
      grid: {
        borderColor: "var(--mf-color-border-subtle)",
        strokeDashArray: 3,
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: {
            colors: ["var(--mf-color-text-secondary)"],
            fontSize: "11px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: ["var(--mf-color-text-secondary)"],
            fontSize: "11px",
          },
        },
      },
      tooltip: { theme: "dark" },
    });

    return (
      <ChartCard
        title={effective.title}
        chartType={effective.chartType || "line"}
        options={options}
        series={series}
        isLoading={isLoading}
        error={error}
        timeframeOptions={TF_OPTIONS}
        activeTimeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
        showFooterTotals
      />
    );
  }

  // -------------------
  // TABLE: kind === table
  // -------------------
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

  return (
    <DashboardCard title={effective.title}>
      <div className="card-empty-message">Unsupported payload kind for this card.</div>
    </DashboardCard>
  );
}

export default DashboardCardController;

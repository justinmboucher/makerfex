// src/components/dashboard/MetricCard.jsx
import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { DashboardCard } from "./DashboardCard";

import "../../styles/components/MetricCard.css";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function toneToAccentVar(tone) {
  switch (tone) {
    case "risk":
      return "var(--mf-accent-risk)";
    case "success":
      return "var(--mf-accent-success)";
    case "revenue":
      return "var(--mf-accent-revenue)";
    case "capacity":
      return "var(--mf-accent-capacity)";
    case "danger":
      return "var(--mf-accent-danger)";
    default:
      return "var(--mf-accent-neutral)";
  }
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  tone = "neutral",

  trendDirection,          // up | down | flat
  trendDelta,
  trendDeltaIsPct = false,
  trendTimeframe,
  trendGoodDirection = "up",

  sparklinePoints,
  isLoading,
  error,
}) {
  const formattedValue =
    value === null || value === undefined ? "—" : value.toString();

  const pctText = useMemo(() => {
    if (trendDelta == null) return null;
    const pct = trendDeltaIsPct ? trendDelta : trendDelta * 100;
    return `${pct.toFixed(2)}%`;
  }, [trendDelta, trendDeltaIsPct]);

  const trendArrow =
    trendDirection === "up"
      ? "↗"
      : trendDirection === "down"
      ? "↘"
      : trendDirection === "flat"
      ? "→"
      : null;

  const trendIntent =
    !trendDirection || trendDirection === "flat"
      ? "is-flat"
      : trendDirection === trendGoodDirection
      ? "is-good"
      : "is-bad";

  const hasSparkline =
    Array.isArray(sparklinePoints) && sparklinePoints.length > 1;

  const accentColor = toneToAccentVar(tone);

  const sparklineOptions = useMemo(() => {
    if (!hasSparkline) return null;

    return {
      chart: {
        sparkline: { enabled: true },
        toolbar: { show: false },
        background: "transparent",
      },
      stroke: {
        curve: "smooth",
        width: 3,
        lineCap: "round",
      },
      dataLabels: { enabled: false },
      grid: { show: false },
      tooltip: {
        theme: "dark",
        x: { show: false },
      },
      colors: [accentColor],
    };
  }, [hasSparkline, accentColor]);

  const sparklineSeries = useMemo(() => {
    if (!hasSparkline) return null;
    return [
      {
        name: title || "Metric",
        data: sparklinePoints.map((pt) => ({ x: pt.t, y: pt.v })),
      },
    ];
  }, [hasSparkline, sparklinePoints, title]);

  return (
    <DashboardCard title={null} isLoading={isLoading} error={error}>
      <div
        className={cx("mf-metric-card", `tone-${tone}`)}
        style={{ "--mf-metric-accent": accentColor }}
      >
        <div className="mf-metric-card__accent" />

        <div className="mf-metric-card__content">
          <div className="mf-metric-card__top">
            <div className="mf-metric-card__meta">
              <div className="mf-metric-card__title">{title}</div>

              <div className="mf-metric-card__value">
                {unit === "$" && <span className="mf-metric-card__unit">$</span>}
                <span className="mf-metric-card__number">{formattedValue}</span>
                {unit && unit !== "$" && (
                  <span className="mf-metric-card__unit">{unit}</span>
                )}
              </div>

              {(pctText || trendTimeframe) && (
                <div className={cx("mf-metric-card__trend", trendIntent)}>
                  {pctText && (
                    <span className="mf-metric-card__trend-pct">
                      {trendArrow && (
                        <span className="mf-metric-card__trend-arrow">
                          {trendArrow}
                        </span>
                      )}
                      {pctText}
                    </span>
                  )}
                  {trendTimeframe && (
                    <span className="mf-metric-card__trend-timeframe">
                      {trendTimeframe}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mf-metric-card__right">
              {icon && (
                <div className="mf-metric-card__icon" aria-hidden="true">
                  {icon}
                </div>
              )}

              {hasSparkline && (
                <div className="mf-metric-card__sparkline">
                  <ReactApexChart
                    type="line"
                    options={sparklineOptions}
                    series={sparklineSeries}
                    height={46}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

export default MetricCard;

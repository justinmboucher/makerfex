// src/components/dashboard/MetricCard.jsx
import React from "react";
import ReactApexChart from "react-apexcharts";
import { DashboardCard } from "./DashboardCard";

export function MetricCard({
  title,
  value,
  unit,
  trendDirection,
  trendDelta,
  trendLabel,
  sparklinePoints,
  isLoading,
  error,
}) {
  const formattedValue =
    value === null || value === undefined ? "—" : value.toString();

  let trendText = null;
  if (trendDirection && trendDelta != null) {
    const pct = (trendDelta * 100).toFixed(1);
    const arrow =
      trendDirection === "up"
        ? "↑"
        : trendDirection === "down"
        ? "↓"
        : "→";
    trendText = `${arrow} ${pct}%${trendLabel ? ` ${trendLabel}` : ""}`;
  }

  const hasSparkline = Array.isArray(sparklinePoints) && sparklinePoints.length > 0;

  let sparklineOptions = null;
  let sparklineSeries = null;

  if (hasSparkline) {
    sparklineOptions = {
      chart: {
        id: `${title || "metric"}-sparkline`,
        sparkline: { enabled: true },
        background: "transparent",
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        theme: "dark",
        x: {
          show: false,
        },
      },
      colors: ["var(--mf-color-accent)"],
    };

    sparklineSeries = [
      {
        name: title || "Metric",
        data: sparklinePoints.map((pt) => ({
          x: pt.t,
          y: pt.v,
        })),
      },
    ];
  }

  return (
    <DashboardCard title={title} isLoading={isLoading} error={error}>
      <div className="metric-card metric-card--with-sparkline">
        <div className="metric-card__main">
          <div className="metric-card__value">
            {unit === "$" ? "$" : null}
            {formattedValue}
            {unit && unit !== "$" && (
              <span className="metric-card__unit"> {unit}</span>
            )}
          </div>
          {trendText && (
            <div className="metric-card__trend">{trendText}</div>
          )}
          {trendLabel && !trendText && (
            <div className="metric-card__trend metric-card__trend--label-only">
              {trendLabel}
            </div>
          )}
        </div>

        {hasSparkline && (
          <div className="metric-card__sparkline">
            <ReactApexChart
              type="line"
              options={sparklineOptions}
              series={sparklineSeries}
              height={46}
              width="100%"
            />
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

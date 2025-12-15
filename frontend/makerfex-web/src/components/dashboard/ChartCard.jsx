// src/components/dashboard/ChartCard.jsx
import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import "../../styles/components/ChartCard.css";

/**
 * ChartCard
 * - Header: title (left) + timeframe pills (right)
 * - Body: legend + chart
 * - Footer: totals for visible series (for current timeframe)
 *
 * Notes:
 * - ChartCard remains "dumb": it renders what it is given.
 * - Timeframe buttons work when you pass onTimeframeChange + activeTimeframe.
 */

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function formatCompactNumber(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const num = Number(n);

  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function sumSeries(seriesItem) {
  const data = seriesItem?.data || [];
  if (!Array.isArray(data)) return 0;

  if (data.length && typeof data[0] === "object") {
    return data.reduce((acc, pt) => acc + (Number(pt?.y) || 0), 0);
  }

  return data.reduce((acc, v) => acc + (Number(v) || 0), 0);
}

export function ChartCard({
  title,
  chartType = "bar",
  options,
  series,
  isLoading,
  error,

  timeframeOptions = ["Day", "Week", "Month", "Year"],
  activeTimeframe = "Month",
  onTimeframeChange,

  showFooterTotals = true,
  footerOverride,
}) {
  const safeOptions = useMemo(() => {
    const base = options || {};
    return {
      ...base,
      chart: {
        ...(base.chart || {}),
        type: chartType,
        toolbar: { show: false },
        background: "transparent",
      },
      legend: {
        ...(base.legend || {}),
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontSize: "12px",
        labels: { colors: "var(--mf-color-text-secondary)" },
        markers: { width: 8, height: 8, radius: 12 },
        itemMargin: { horizontal: 10, vertical: 6 },
      },
      tooltip: {
        ...(base.tooltip || {}),
        theme: "dark",
      },
    };
  }, [options, chartType]);

  const footerStats = useMemo(() => {
    if (!showFooterTotals) return [];
    if (Array.isArray(footerOverride)) return footerOverride;

    const s = Array.isArray(series) ? series : [];
    return s.map((item) => ({
      label: item?.name || "Series",
      value: sumSeries(item),
    }));
  }, [series, showFooterTotals, footerOverride]);

  const canChange = typeof onTimeframeChange === "function";

  return (
    <div className="mf-chart-card">
      {/* Header */}
      <div className="mf-chart-card__header">
        <div className="mf-chart-card__title">{title}</div>

        <div className="mf-chart-card__timeframes" aria-label="Timeframes">
          {timeframeOptions.map((tf) => {
            const isActive = tf === activeTimeframe;
            return (
              <button
                key={tf}
                type="button"
                className={cx("mf-chart-card__tf", isActive && "is-active")}
                onClick={() => canChange && onTimeframeChange(tf)}
                aria-disabled={!canChange}
                title={canChange ? `Show ${tf}` : "Timeframes not wired"}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="mf-chart-card__body">
        {isLoading ? (
          <div className="mf-chart-card__state">Loading…</div>
        ) : error ? (
          <div className="mf-chart-card__state">Unable to load chart.</div>
        ) : (
          <Chart options={safeOptions} series={series} type={chartType} height={320} />
        )}
      </div>

      {/* Footer */}
      {showFooterTotals && footerStats.length > 0 ? (
        <div className="mf-chart-card__footer">
          {footerStats.map((x, idx) => (
            <div key={`${x.label}-${idx}`} className="mf-chart-card__footer-item">
              <div className="mf-chart-card__footer-label">{x.label}</div>
              <div className="mf-chart-card__footer-value">{formatCompactNumber(x.value)}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ChartCard;

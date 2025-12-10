// src/components/metrics/MetricCard.jsx
import React from "react";
import "../../styles/components/MetricCard.css";

/**
 * MetricCard
 *
 * Reusable card for KPIs / stats.
 * Can be used on Dashboard, Projects, Customers, etc.
 */
export function MetricCard({
  label,
  value,
  prefix,
  suffix,
  secondaryLabel,
  secondaryValue,
  trendLabel,
  trendValue,
  trendDirection, // "up" | "down" | "flat"
  icon,
  tone = "neutral", // "neutral" | "success" | "danger" | "warning"
}) {
  const trendClass =
    trendDirection === "up"
      ? "mf-metric-card__trend--up"
      : trendDirection === "down"
      ? "mf-metric-card__trend--down"
      : "mf-metric-card__trend--flat";

  const toneClass = `mf-metric-card--${tone}`;

  return (
    <article className={`mf-metric-card ${toneClass}`}>
      <div className="mf-metric-card__header">
        <div className="mf-metric-card__label-group">
          <div className="mf-metric-card__label">{label}</div>
          {secondaryLabel && secondaryValue != null && (
            <div className="mf-metric-card__secondary">
              <span className="mf-metric-card__secondary-label">
                {secondaryLabel}
              </span>
              <span className="mf-metric-card__secondary-value">
                {secondaryValue}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className="mf-metric-card__icon">
            {icon}
          </div>
        )}
      </div>

      <div className="mf-metric-card__value-row">
        <div className="mf-metric-card__value">
          {prefix && <span className="mf-metric-card__value-prefix">{prefix}</span>}
          <span>{value}</span>
          {suffix && <span className="mf-metric-card__value-suffix">{suffix}</span>}
        </div>

        {trendLabel && trendValue != null && (
          <div className={`mf-metric-card__trend ${trendClass}`}>
            <span className="mf-metric-card__trend-value">{trendValue}</span>
            <span className="mf-metric-card__trend-label">{trendLabel}</span>
          </div>
        )}
      </div>
    </article>
  );
}

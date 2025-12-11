// src/components/dashboard/DashboardCard.jsx
import React from "react";

export function DashboardCard({
  title,
  subtitle,
  isLoading = false,
  error = null,
  children,
}) {
  return (
    <div className="mf-card dashboard-card">
      <div className="mf-card__header">
        {title && <h3 className="mf-card__title">{title}</h3>}
        {subtitle && (
          <div className="mf-card__subtitle">{subtitle}</div>
        )}
      </div>

      <div className="mf-card__body">
        {isLoading && (
          <div className="dashboard-card__loading">Loading...</div>
        )}
        {!isLoading && error && (
          <div className="dashboard-card__error">
            Unable to load this card.
          </div>
        )}
        {!isLoading && !error && children}
      </div>
    </div>
  );
}

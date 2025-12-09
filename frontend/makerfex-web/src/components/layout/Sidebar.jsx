// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/layout/Sidebar.css";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Sidebar
 *
 * Props:
 * - sections: [
 *     {
 *       id: "overview",
 *       title: "Overview",
 *       items: [{ id, label, icon, to }]
 *     }
 *   ]
 * - collapsed: boolean
 * - onToggleCollapsed(): void
 * - brandLabel: string
 * - footerText: string
 */
export function Sidebar({
  sections,
  collapsed = false,
  onToggleCollapsed,
  brandLabel = "Makerfex",
  footerText = "Demo shop",
}) {
  return (
    <aside
      className={classNames(
        "mf-sidebar",
        collapsed && "mf-sidebar--collapsed"
      )}
    >
      {/* Brand + collapse toggle */}
      <div className="mf-sidebar__brand-row">
        <div className="mf-sidebar__brand">
          <div className="mf-sidebar__logo-mark">MF</div>
          <div className="mf-sidebar__brand-text">
            <div className="mf-sidebar__brand-name">{brandLabel}</div>
            <div className="mf-sidebar__brand-tagline">
              Shop ops command center
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mf-sidebar__collapse-toggle"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="mf-sidebar__collapse-icon">
            {collapsed ? "»" : "«"}
          </span>
        </button>
      </div>

      {/* Nav sections */}
      <nav className="mf-sidebar__nav" aria-label="Primary">
        {sections?.map((section) => (
          <div key={section.id} className="mf-sidebar__section">
            <div className="mf-sidebar__section-label">
              {section.title}
            </div>
            <div className="mf-sidebar__section-items">
              {section.items?.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) =>
                    classNames(
                      "mf-sidebar-link",
                      isActive && "mf-sidebar-link--active"
                    )
                  }
                >
                  <span className="mf-sidebar-link__icon">
                    {item.icon}
                  </span>
                  <span className="mf-sidebar-link__label">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mf-sidebar__footer">
        <span className="mf-sidebar__footer-pill">{footerText}</span>
        <span className="mf-sidebar__footer-version">v1.0.0</span>
      </div>
    </aside>
  );
}

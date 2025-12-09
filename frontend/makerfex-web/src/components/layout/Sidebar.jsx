// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/layout/Sidebar.css";
import { HelpCircle } from "lucide-react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Sidebar({
  sections,
  collapsed = false,
  onToggleCollapsed,
}) {
  return (
    <aside
      className={cx("mf-sidebar", collapsed && "mf-sidebar--collapsed")}
    >
      {/* Brand block */}
      <div className="mf-sidebar__header">
        <div className="mf-sidebar__brand">
          <div className="mf-sidebar__brand-logo-wrapper">
            <img
              src="/images/makerfex-logo.svg"
              alt="MAKERFEX"
              className="mf-sidebar__brand-logo"
            />
          </div>
          {!collapsed && (
            <div className="mf-sidebar__brand-wordmark">
              MAKERFEX
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          className="mf-sidebar__collapse-toggle"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mf-sidebar__nav">
        {sections.map((section) => (
          <div key={section.id} className="mf-sidebar__section">
            {!collapsed && (
              <div className="mf-sidebar__section-label">
                {section.title}
              </div>
            )}
            <div className="mf-sidebar__section-items">
              {section.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) =>
                    cx(
                      "mf-sidebar__link",
                      isActive && "mf-sidebar__link--active",
                      collapsed && "mf-sidebar__link--icon-only"
                    )
                  }
                >
                  <span className="mf-sidebar__link-icon">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="mf-sidebar__link-label">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

            {/* Footer: Help & Docs */}
      <div className="mf-sidebar__footer">
        <div className="mf-sidebar__footer-divider" />
        <a
          href="http://127.0.0.1:8001/user-guide/getting-started/"
          target="_blank"
          rel="noreferrer"
          className={cx(
            "mf-sidebar__footer-link",
            collapsed && "mf-sidebar__footer-link--icon-only"
          )}
        >
          <span className="mf-sidebar__footer-link-icon">
            <HelpCircle size={16} />
          </span>
          {!collapsed && (
            <span className="mf-sidebar__footer-link-label">
              Help &amp; Docs
            </span>
          )}
        </a>
      </div>
    </aside>
  );
}

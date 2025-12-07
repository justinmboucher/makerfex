// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * sections: [
 *  {
 *    id: "overview",
 *    title: "Overview",
 *    items: [
 *      { id: "dashboard", label: "Dashboard", icon: <Icon />, to: "/dashboard" },
 *      ...
 *    ]
 *  }
 * ]
 */
export function Sidebar({ sections, brandLabel = "Makerfex", footerText }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={classNames("mf-sidebar", collapsed && "mf-sidebar--collapsed")}>
      <div className="mf-sidebar__header">
        <div className="mf-sidebar__brand">
          <div className="mf-sidebar__brand-icon">
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>M</span>
          </div>
          <span className="mf-sidebar__brand-mark">{brandLabel}</span>
        </div>

        <button
          type="button"
          className="mf-sidebar__toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <span style={{ fontSize: "0.85rem" }}>{collapsed ? "»" : "«"}</span>
        </button>
      </div>

      <nav className="mf-sidebar__nav">
        {sections?.map((section) => (
          <div key={section.id}>
            <div className="mf-sidebar__section-title">{section.title}</div>
            <div className="mf-sidebar__link-list">
              {section.items?.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) =>
                    classNames(
                      "mf-sidebar-link",
                      isActive && "mf-sidebar-link--active",
                    )
                  }
                >
                  <span className="mf-sidebar-link__icon">
                    {item.icon || <span style={{ width: 16 }} />}
                  </span>
                  <span className="mf-sidebar-link__label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mf-sidebar__footer">
        {footerText && <div className="mf-sidebar__footer-label">{footerText}</div>}
        <div>v1.0.0</div>
      </div>
    </aside>
  );
}

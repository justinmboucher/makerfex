// src/components/layout/Topbar.jsx
import React from "react";
import "./Topbar.css";
import { Search, Bell } from "lucide-react";
import { TextField } from "../ui/TextField";

export function Topbar({ title, subtitle, onSearchChange, user }) {
  const displayName = user?.name || "Workspace Owner";
  const role = user?.role || "Makerfex Admin";

  return (
    <header className="mf-topbar">
      <div className="mf-topbar__left">
        {title && <div className="mf-topbar__title">{title}</div>}
        {subtitle && <div className="mf-topbar__subtitle">{subtitle}</div>}
      </div>

      <div className="mf-topbar__center">
        <div className="mf-topbar__search">
          <TextField
            label={null}
            placeholder="Search projects, customers, inventory..."
            leftIcon={<Search size={16} />}
            size="sm"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      <div className="mf-topbar__right">
        <button type="button" className="mf-icon-button" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="mf-topbar__user" role="button" tabIndex={0}>
          <div className="mf-topbar__avatar">
            {displayName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="mf-topbar__user-info">
            <span className="mf-topbar__user-name">{displayName}</span>
            <span className="mf-topbar__user-role">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

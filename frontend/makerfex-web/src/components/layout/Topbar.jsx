import React, { useState, useRef, useEffect } from "react";
import "../../styles/layout/Topbar.css";
import { Search, Bell, ChevronDown, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/authContext";

import { GlobalSearch } from "./GlobalSearch";

// ---- Helper functions ----

// "john doe" -> "John Doe"
function toTitleCase(str) {
  if (!str) return "";
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

// Build display name as "First Last" when possible
function getDisplayName(user) {
  if (!user) return "Workspace owner";

  const first =
    user.first_name || user.firstName || user.given_name || "";
  const last =
    user.last_name || user.lastName || user.family_name || "";

  if (first || last) {
    return toTitleCase(`${first} ${last}`.trim());
  }

  if (user.full_name) return toTitleCase(user.full_name);
  if (user.name) return toTitleCase(user.name);

  if (user.username) {
    // turn "demouser" or "john.doe" into something like "Demo User" if possible
    const cleaned = user.username
      .replace(/[@]/g, " ")
      .replace(/[._-]/g, " ");
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return toTitleCase(`${parts[0]} ${parts[1]}`);
    }
    return toTitleCase(cleaned);
  }

  return "Workspace owner";
}

// "John Doe" -> "JD", "Demo User" -> "DU"
function getInitialsFromName(name) {
  if (!name) return "MF";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0][0] || "";
    const last = parts[parts.length - 1][0] || "";
    return (first + last).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "MF";
}

// Simple theme hook using data-theme + localStorage
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("mf-theme");
    if (stored === "dark" || stored === "light") return stored;
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return "dark";
    return "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("mf-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return { theme, toggleTheme };
}

// ---- Component ----

export function Topbar({
  title,
  breadcrumbs = [],
  onSearchChange,
  primaryAction,
}) {
  const auth = useAuth();
  const { user, shop, logout } = auth || {};
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = getDisplayName(user);
  const initials = getInitialsFromName(displayName);
  const shopName = shop?.name || "MAKERFEX shop";

  // future-proof avatar; you can add these fields to your models later
  const avatarUrl =
    user?.avatar_url ||
    user?.avatar ||
    user?.profile_image ||
    user?.profile_image_url;

  useEffect(() => {
    function handleClickOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      if (logout) {
        await logout();
      } else {
        window.location.href = "/login";
      }
    } finally {
      setMenuOpen(false);
    }
  }

  const themeIsDark = theme === "dark";

  return (
    <header className="mf-topbar">
      <div className="mf-topbar__left">
        <div className="mf-topbar__breadcrumbs">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, idx) => (
              <span
                key={`${crumb.label}-${idx}`}
                className="mf-topbar__crumb"
              >
                {idx > 0 && (
                  <span className="mf-topbar__crumb-separator">/</span>
                )}
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  crumb.label
                )}
              </span>
            ))
          ) : (
            <span className="mf-topbar__crumb mf-topbar__title-fallback">
              {title}
            </span>
          )}
        </div>

        {title && <h1 className="mf-topbar__title">{title}</h1>}

        {shopName && <span className="mf-topbar__subtitle">{shopName}</span>}
      </div>

      <div className="mf-topbar__right">
        <GlobalSearch onSearchChange={onSearchChange} />

        {primaryAction && (
          <Button
            variant="primary"
            size="sm"
            as={primaryAction.to ? Link : "button"}
            to={primaryAction.to}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          className="mf-topbar__icon-button"
          aria-label={themeIsDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        >
          {themeIsDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="mf-topbar__icon-button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* User menu */}
        <div className="mf-topbar__user-wrapper" ref={menuRef}>
          <button
            type="button"
            className="mf-topbar__user-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="mf-topbar__avatar mf-topbar__avatar--image"
              />
            ) : (
              <div className="mf-topbar__avatar">{initials}</div>
            )}

            <div className="mf-topbar__user-meta">
              <span className="mf-topbar__user-name">{displayName}</span>
              {shopName && (
                <span className="mf-topbar__user-role">
                  {shopName}
                </span>
              )}
            </div>
            <ChevronDown size={16} />
          </button>

          {menuOpen && (
            <div className="mf-topbar__user-dropdown">
              <button
                type="button"
                className="mf-topbar__user-dropdown-item"
              >
                My profile
              </button>
              <button
                type="button"
                className="mf-topbar__user-dropdown-item"
              >
                Account settings
              </button>

              <div className="mf-topbar__user-dropdown-separator" />

              <button
                type="button"
                className="mf-topbar__user-dropdown-item mf-topbar__user-dropdown-item--danger"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

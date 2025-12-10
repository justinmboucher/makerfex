// src/components/layout/Topbar.jsx
import React, { useState, useRef, useEffect } from "react";
import "../../styles/layout/Topbar.css";
import {
  Bell,
  ChevronDown,
  Sun,
  Moon,
  User,
  UserCog,
  UserLock,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/authContext";
import { GlobalSearch } from "./GlobalSearch";

// ------------------------
// Helper functions
// ------------------------

function toTitleCase(str) {
  if (!str) return "";
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getDisplayName(user) {
  if (!user) return "Workspace owner";

  const first = user.first_name || user.firstName || user.given_name || "";
  const last = user.last_name || user.lastName || user.family_name || "";

  if (first || last) return toTitleCase(`${first} ${last}`.trim());
  if (user.full_name) return toTitleCase(user.full_name);
  if (user.name) return toTitleCase(user.name);

  if (user.username) {
    const cleaned = user.username
      .replace(/[@]/g, " ")
      .replace(/[._-]/g, " ");
    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) return toTitleCase(`${parts[0]} ${parts[1]}`);
    return toTitleCase(cleaned);
  }

  return "Workspace owner";
}

function getInitialsFromName(name) {
  if (!name) return "MF";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "MF";
}

// ------------------------
// Theme hook
// ------------------------

function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("mf-theme");
    if (stored === "dark" || stored === "light") return stored;
    const attr = document.documentElement.getAttribute("data-theme");
    return attr === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("mf-theme", theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
  };
}

// ------------------------
// Component
// ------------------------

export function Topbar({
  title,
  breadcrumbs = [],
  onSearchChange,
  primaryAction,
}) {
  const auth = useAuth();
  const { user, shop, logout } = auth || {};
  const { theme, toggleTheme } = useTheme();

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = getDisplayName(user);
  const initials = getInitialsFromName(displayName);
  const shopName = shop?.name || "MAKERFEX shop";

  const shopLogoUrl =
    shop?.logo_url || shop?.logo || shop?.logoUrl || null;

  const avatarUrl =
    user?.avatar_url ||
    user?.avatar ||
    user?.profile_image ||
    user?.profile_image_url;

  useEffect(() => {
    function handleClickOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLockScreen() {
    // TODO: implement real lock logic (route to /lock, clear tokens, etc.)
    console.log("Lock screen requested");
    setMenuOpen(false);
  }

  async function handleLogout() {
    try {
      if (logout) await logout();
      else window.location.href = "/login";
    } finally {
      setMenuOpen(false);
    }
  }

  const themeIsDark = theme === "dark";

  return (
    <header className="mf-topbar">
      <div className="mf-topbar__inner">

        {/* ------------------------ */}
        {/* LEFT SIDE */}
        {/* ------------------------ */}
        <div className="mf-topbar__left">

          {/* Breadcrumbs */}
          <div className="mf-topbar__breadcrumbs">
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, idx) => (
                <span key={`${crumb.label}-${idx}`} className="mf-topbar__crumb">
                  {idx > 0 && <span className="mf-topbar__crumb-separator">/</span>}
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
                </span>
              ))
            ) : (
              <span className="mf-topbar__crumb mf-topbar__title-fallback">
                {title}
              </span>
            )}
          </div>

          {/* Logo + Title/Shop Row */}
          <div className="mf-topbar__title-row">
            {shopLogoUrl && (
              <img
                src={shopLogoUrl}
                alt={shopName}
                className="mf-topbar__shop-logo"
              />
            )}

            <div className="mf-topbar__title-stack">
              {title && <h1 className="mf-topbar__title">{title}</h1>}
              {shopName && (
                <span className="mf-topbar__subtitle mf-topbar__subtitle--shop">
                  {shopName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------ */}
        {/* RIGHT SIDE */}
        {/* ------------------------ */}
        <div className="mf-topbar__right">
          <div className="mf-topbar__search">
            <GlobalSearch onSearchChange={onSearchChange} />
          </div>

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
                  <span className="mf-topbar__user-role">{shopName}</span>
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
                  <User size={16} className="mf-topbar__user-dropdown-icon" />
                  <span>My profile</span>
                </button>

                <button
                  type="button"
                  className="mf-topbar__user-dropdown-item"
                >
                  <UserCog size={16} className="mf-topbar__user-dropdown-icon" />
                  <span>Account settings</span>
                </button>

                <div className="mf-topbar__user-dropdown-separator" />

                <button
                  type="button"
                  className="mf-topbar__user-dropdown-item"
                  onClick={handleLockScreen}
                >
                  <UserLock size={16} className="mf-topbar__user-dropdown-icon" />
                  <span>Lock screen</span>
                </button>

                <button
                  type="button"
                  className="mf-topbar__user-dropdown-item mf-topbar__user-dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mf-topbar__user-dropdown-icon" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

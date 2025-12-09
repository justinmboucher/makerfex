import React, { useState, useRef, useEffect } from "react";
import "../../styles/layout/Topbar.css";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/authContext";

export function Topbar({
  title,
  breadcrumbs = [],
  onSearchChange,
  primaryAction,
}) {
  const auth = useAuth();
  const { user, shop, logout } = auth || {};

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName =
    user?.full_name || user?.name || user?.username || "Workspace owner";

  const shopName = shop?.name || "MAKERFEX shop";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
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
        <div className="mf-topbar__search">
          <TextField
            size="sm"
            placeholder="Search projects, customers..."
            leftIcon={<Search size={16} />}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
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

        <button
          type="button"
          className="mf-topbar__icon-button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="mf-topbar__user-wrapper" ref={menuRef}>
          <button
            type="button"
            className="mf-topbar__user-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <div className="mf-topbar__avatar">{initials}</div>
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

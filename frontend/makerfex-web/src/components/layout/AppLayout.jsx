// src/components/layout/AppLayout.jsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/layout/AppLayout.css";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import OwnerInsightRail from "../../dashboard/OwnerInsightRail";

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Boxes,
  LineChart,
  Settings2,
  Bot,
} from "lucide-react";

/**
 * AppLayout
 *
 * Global authenticated application shell.
 * Handles:
 * - Left navigation sidebar
 * - Topbar
 * - Content area (scroll)
 * - Right insights drawer (layout-level sidebar)
 *
 * Pages should NOT render their own right rail. They render content only.
 * The right rail lives here and can be shown/hidden per-route.
 */

function getPageConfig(pathname) {
  const path = pathname || "/";

  if (path === "/" || path.startsWith("/dashboard")) {
    return { title: "Dashboard", breadcrumbs: [{ label: "Dashboard" }] };
  }

  if (path.startsWith("/projects")) {
    return {
      title: "Projects",
      breadcrumbs: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Projects" },
      ],
    };
  }

  if (path.startsWith("/customers")) {
    return {
      title: "Customers",
      breadcrumbs: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Customers" },
      ],
    };
  }

  if (path.startsWith("/inventory")) {
    return {
      title: "Inventory",
      breadcrumbs: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Inventory" },
      ],
    };
  }

  if (path.startsWith("/workflows")) {
    return {
      title: "Workflows",
      breadcrumbs: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Workflows" },
      ],
    };
  }

  if (path.startsWith("/analytics")) {
    return {
      title: "Analytics",
      breadcrumbs: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Analytics" },
      ],
    };
  }

  if (path.startsWith("/assistants")) {
    return {
      title: "Assistants",
      breadcrumbs: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Assistants" },
      ],
    };
  }

  if (path.startsWith("/settings")) {
    return {
      title: "Settings",
      breadcrumbs: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Settings" },
      ],
    };
  }

  return { title: "MAKERFEX", breadcrumbs: [{ label: "Dashboard", to: "/dashboard" }] };
}

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const pageConfig = useMemo(
    () => getPageConfig(location.pathname),
    [location.pathname]
  );

  const sections = useMemo(
    () => [
      {
        id: "overview",
        title: "Overview",
        items: [
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, to: "/dashboard" },
          { id: "projects", label: "Projects", icon: <FolderKanban size={18} />, to: "/projects" },
          { id: "customers", label: "Customers", icon: <Users size={18} />, to: "/customers" },
        ],
      },
      {
        id: "operations",
        title: "Operations",
        items: [
          { id: "inventory", label: "Inventory", icon: <Boxes size={18} />, to: "/inventory" },
          { id: "workflows", label: "Workflows", icon: <FolderKanban size={18} />, to: "/workflows" },
        ],
      },
      {
        id: "insights",
        title: "Insights",
        items: [
          { id: "analytics", label: "Analytics", icon: <LineChart size={18} />, to: "/analytics" },
          { id: "assistants", label: "Assistants", icon: <Bot size={18} />, to: "/assistants" },
        ],
      },
      {
        id: "system",
        title: "System",
        items: [
          { id: "settings", label: "Settings", icon: <Settings2 size={18} />, to: "/settings" },
        ],
      },
    ],
    []
  );

  const pathname = location.pathname || "/";
  const isDashboardRoute = pathname === "/" || pathname.startsWith("/dashboard");

  // Route default (derived, no effects):
  const routeDefaultOpen = isDashboardRoute; // dashboard open, others closed
  const routeDefaultTab = "insights";

  // Manual overrides should reset when route changes.
  // We do that by storing pathname alongside the manual state and reinitializing when it changes.
  const [drawerState, setDrawerState] = useState(() => ({
    pathname,
    manualOpen: null, // null means "use route default"
    manualTab: null,  // null means "use route default"
  }));

  if (drawerState.pathname !== pathname) {

    setDrawerState({ pathname, manualOpen: null, manualTab: null });
  }

  const insightsOpen = drawerState.manualOpen ?? routeDefaultOpen;
  const insightsTab = drawerState.manualTab ?? routeDefaultTab;

  function setInsightsOpen(nextOpen) {
    setDrawerState((prev) => ({ ...prev, manualOpen: nextOpen }));
  }

  function setInsightsTab(nextTab) {
    setDrawerState((prev) => ({ ...prev, manualTab: nextTab }));
  }

  function handleNotificationsClick() {
    setDrawerState((prev) => ({
      ...prev,
      manualOpen: true,
      manualTab: "notifications",
    }));
  }

  const shellClass = [
    "mf-shell",
    collapsed ? "mf-shell--collapsed" : "",
    !insightsOpen ? "mf-shell--drawer-closed" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={shellClass}>
      <Sidebar
        sections={sections}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        brandLabel="MAKERFEX"
        footerText="SHOP COMMAND CENTER"
      />

      <div className="mf-shell__main">
        <Topbar
          title={pageConfig.title}
          breadcrumbs={pageConfig.breadcrumbs}
          onNotificationsClick={handleNotificationsClick}
        />

        <div className="mf-shell__content">
          <div className="mf-shell__content-row">
            <div className="mf-shell__content-inner">{children}</div>

            <div className="mf-shell__right-drawer">
              <OwnerInsightRail
                open={insightsOpen}
                onToggle={setInsightsOpen}
                tab={insightsTab}
                onTabChange={setInsightsTab}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/layout/AppLayout.css";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Boxes,
  LineChart,
  Settings2,
  Bot,
} from "lucide-react";

function getPageConfig(pathname) {
  const path = pathname || "/";

  if (path === "/" || path.startsWith("/dashboard")) {
    return {
      title: "Dashboard",
      breadcrumbs: [{ label: "Dashboard" }],
    };
  }

  if (path.startsWith("/projects")) {
    return {
      title: "Projects",
      breadcrumbs: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Projects" },
      ],
      // primaryAction: { label: "NEW PROJECT", to: "/projects/new" },
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

  return {
    title: "MAKERFEX",
    breadcrumbs: [{ label: "Dashboard", to: "/dashboard" }],
  };
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
          {
            id: "dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard size={18} />,
            to: "/dashboard",
          },
          {
            id: "projects",
            label: "Projects",
            icon: <FolderKanban size={18} />,
            to: "/projects",
          },
          {
            id: "customers",
            label: "Customers",
            icon: <Users size={18} />,
            to: "/customers",
          },
        ],
      },
      {
        id: "operations",
        title: "Operations",
        items: [
          {
            id: "inventory",
            label: "Inventory",
            icon: <Boxes size={18} />,
            to: "/inventory",
          },
          {
            id: "workflows",
            label: "Workflows",
            icon: <FolderKanban size={18} />,
            to: "/workflows",
          },
        ],
      },
      {
        id: "insights",
        title: "Insights",
        items: [
          {
            id: "analytics",
            label: "Analytics",
            icon: <LineChart size={18} />,
            to: "/analytics",
          },
          {
            id: "assistants",
            label: "Assistants",
            icon: <Bot size={18} />,
            to: "/assistants",
          },
        ],
      },
      {
        id: "system",
        title: "System",
        items: [
          {
            id: "settings",
            label: "Settings",
            icon: <Settings2 size={18} />,
            to: "/settings",
          },
        ],
      },
    ],
    []
  );

  return (
    <div className={collapsed ? "mf-shell mf-shell--collapsed" : "mf-shell"}>
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
          primaryAction={pageConfig.primaryAction}
        />

        <div className="mf-shell__content">
          <div className="mf-shell__content-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}

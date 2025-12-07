// src/layout/AppLayout.jsx
import React from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";

export function AppLayout({ children }) {
  const sections = [
    {
      id: "overview",
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", to: "/dashboard" },
        { id: "projects", label: "Projects", to: "/projects" },
        { id: "customers", label: "Customers", to: "/customers" },
      ],
    },
    {
      id: "operations",
      title: "Operations",
      items: [
        { id: "inventory", label: "Inventory", to: "/inventory" },
        { id: "workflows", label: "Workflows", to: "/workflows" },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar sections={sections} footerText="Makerfex" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar title="Dashboard" subtitle="Shop overview" />
        <main style={{ padding: "24px", backgroundColor: "var(--mf-color-bg-primary)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

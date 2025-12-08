// src/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "../context/authContext";

export default function Dashboard() {
  const { user, shop } = useAuth();

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Dashboard
      </h1>
      <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
        Welcome back, {user?.first_name || user?.username}.
      </p>
      {shop && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            maxWidth: "480px",
          }}
        >
          <div style={{ fontWeight: 600 }}>{shop.name}</div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Timezone: {shop.timezone} • Currency: {shop.currency_code}
          </div>
        </div>
      )}
    </div>
  );
}

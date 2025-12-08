// src/pages/Customers.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const resp = await axiosClient.get("/customers/");
        setCustomers(resp.data);
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  if (loading) {
    return <div style={{ padding: "1.5rem" }}>Loading customers…</div>;
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Customers</h1>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          maxWidth: "900px",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>VIP</th>
            <th style={thStyle}>Source</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td style={tdStyle}>
                {c.first_name} {c.last_name}
              </td>
              <td style={tdStyle}>{c.email}</td>
              <td style={tdStyle}>{c.is_vip ? "⭐" : ""}</td>
              <td style={tdStyle}>{c.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "0.5rem",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "0.85rem",
  color: "#6b7280",
};

const tdStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "0.9rem",
};

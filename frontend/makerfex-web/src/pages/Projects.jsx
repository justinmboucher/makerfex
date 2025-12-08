// src/pages/Projects.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const resp = await axiosClient.get("/projects/");
        setProjects(resp.data);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (loading) {
    return <div style={{ padding: "1.5rem" }}>Loading projects…</div>;
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Projects</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          maxWidth: "1000px",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Priority</th>
            <th style={thStyle}>Due</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const due = p.due_date ? new Date(p.due_date) : null;
            const today = new Date();
            const overdue = due && due < today && p.status === "active";
            const rush = p.priority === "rush";

            return (
              <tr key={p.id}>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.status}</td>
                <td style={tdStyle}>
                  {rush ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      RUSH
                    </span>
                  ) : (
                    p.priority
                  )}
                </td>
                <td style={tdStyle}>
                  {due ? due.toLocaleDateString() : "—"}{" "}
                  {overdue && (
                    <span
                      style={{
                        marginLeft: "0.25rem",
                        fontSize: "0.75rem",
                        color: "#b91c1c",
                        fontWeight: 600,
                      }}
                    >
                      (overdue)
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
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

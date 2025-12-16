// src/pages/makerfex/Projects.tsx
// ============================================================================
// Makerfex Projects Page (Vyzor Shell)
// ----------------------------------------------------------------------------
// Purpose:
// - Phase 4: Prove end-to-end Projects list works inside Vyzor layout.
// - Fetch real Projects from Django and render in a simple table.
//
// Notes:
// - Backend currently returns FK fields as IDs (customer/workflow/etc). :contentReference[oaicite:4]{index=4}
// - Backend viewset currently uses Project.objects.all() (not shop-scoped yet). :contentReference[oaicite:5]{index=5}
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Table, Spinner, Badge, Button } from "react-bootstrap";
import { listProjects } from "../../api/projects";
import type { Project } from "../../api/projects";
import { useNavigate } from "react-router-dom";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

function statusVariant(status: Project["status"]) {
  switch (status) {
    case "active":
      return "success";
    case "on_hold":
      return "warning";
    case "completed":
      return "secondary";
    case "cancelled":
      return "danger";
    default:
      return "light";
  }
}

function priorityVariant(priority: Project["priority"]) {
  switch (priority) {
    case "rush":
      return "danger";
    case "high":
      return "warning";
    case "normal":
      return "info";
    case "low":
      return "secondary";
    default:
      return "light";
  }
}

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { items } = await listProjects();
        if (!alive) return;
        setItems(items);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || "Failed to load projects");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => items, [items]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Makerfex Projects</h3>
        <div style={{ opacity: 0.75 }}>{rows.length} loaded</div>
      </div>

      {loading && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner animation="border" size="sm" />
          <span>Loading projects…</span>
        </div>
      )}

      {err && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <div style={{ marginTop: 16 }}>
          <Table responsive hover>
            <thead>
              <tr>
                <th style={{ width: 56 }}>Photo</th>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Customer</th>
                <th>Assigned</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.photo_url ? (
                      <img
                        src={p.photo_url}
                        alt=""
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }}
                      />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(0,0,0,0.08)" }} />
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.reference_code ? <div style={{ fontSize: 12, opacity: 0.7 }}>{p.reference_code}</div> : null}
                  </td>
                  <td>
                    <Badge bg={statusVariant(p.status)}>{p.status}</Badge>
                  </td>
                  <td>
                    <Badge bg={priorityVariant(p.priority)}>{p.priority}</Badge>
                  </td>
                  <td>{formatDate(p.due_date)}</td>
                  <td>{p.customer_name ?? "—"}</td>
                  <td>{p.assigned_to_name || "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", opacity: 0.7, padding: 24 }}>
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

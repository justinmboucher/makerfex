// src/pages/makerfex/ProjectDetail.tsx
// ============================================================================
// Makerfex Project Detail (Phase 4)
// ----------------------------------------------------------------------------
// Purpose:
// - Prove detail endpoint works end-to-end inside Vyzor layout.
// - Fetch a single project and render JSON (UI comes later).
// ============================================================================

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Button } from "react-bootstrap";
import { getProject } from "../../api/projects";
import type { Project } from "../../api/projects";

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);

  const [data, setData] = useState<Project | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (!Number.isFinite(projectId)) throw new Error("Invalid project id");
        const p = await getProject(projectId);
        if (!alive) return;
        setData(p);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load project");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Project #{id}</h3>
        <Button variant="outline-secondary" size="sm" onClick={() => history.back()}>
          Back
        </Button>
      </div>

      {loading && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner animation="border" size="sm" />
          <span>Loading…</span>
        </div>
      )}

      {err && <div style={{ marginTop: 16, color: "crimson" }}>{err}</div>}

      {!loading && !err && (
        <pre style={{ marginTop: 16, background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

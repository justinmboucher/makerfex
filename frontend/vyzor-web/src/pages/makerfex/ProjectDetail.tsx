// src/pages/makerfex/ProjectDetail.tsx
// ============================================================================
// Makerfex Project Detail (Phase 4)
// ----------------------------------------------------------------------------
// Purpose:
// - Render a useful project summary (not raw JSON) inside the Vyzor shell.
// - Keep styling minimal (React-Bootstrap only).
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { getProject } from "../../api/projects";
import type { Project } from "../../api/projects";

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

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

  const title = useMemo(() => {
    if (!data) return `Project #${id}`;
    return data.name || `Project #${id}`;
  }, [data, id]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
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

      {!loading && !err && data && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <Card>
            <Card.Body>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{data.name}</div>
                  {data.reference_code ? (
                    <div style={{ opacity: 0.75 }}>Ref: {data.reference_code}</div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Badge bg="secondary">{data.status}</Badge>
                  <Badge bg="info">{data.priority}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Due</div>
                  <div>{formatDate((data as any).due_date)}</div>
                </Col>

                <Col md={4}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Assigned To</div>
                  <div>{(data as any).assigned_to_name || "—"}</div>
                </Col>

                <Col md={4}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Customer</div>
                  <div>{(data as any).customer_name || "—"}</div>
                </Col>

                <Col md={12}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Description</div>
                  <div>{data.description || "—"}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}

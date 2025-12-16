// src/pages/makerfex/ProjectDetail.tsx
// ============================================================================
// Makerfex Project Detail (Phase 4)
// ----------------------------------------------------------------------------
// Purpose:
// - Render a useful project summary (not raw JSON) inside the Vyzor shell.
// - Keep styling minimal (React-Bootstrap only).
// - Add relational navigation (Customer link).
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
    <>
      <h3 className="mb-3">{title}</h3>

      <Button variant="link" className="p-0 mb-3" onClick={() => history.back()}>
        &larr; Back
      </Button>

      {loading && (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading…</span>
        </div>
      )}

      {err && <div className="text-danger">{err}</div>}

      {!loading && !err && data && (
        <Card>
          <Card.Body>
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div>
                <h4 className="mb-1">{data.name}</h4>
                {data.reference_code ? (
                  <div className="text-muted">Ref: {data.reference_code}</div>
                ) : null}
              </div>

              <div className="d-flex gap-2">
                <Badge bg="secondary">{data.status}</Badge>
                {data.priority ? <Badge bg="info">{data.priority}</Badge> : null}
              </div>
            </div>

            <Row className="mt-3 g-2">
              <Col sm={6}>
                <div className="text-muted">Due</div>
                <div>{formatDate((data as any).due_date)}</div>
              </Col>

              <Col sm={6}>
                <div className="text-muted">Assigned To</div>
                <div>{(data as any).assigned_to_name || "—"}</div>
              </Col>

              <Col sm={12}>
                <div className="text-muted">Customer</div>
                <div>
                  {(data as any).customer ? (
                    <Link to={`/customers/${(data as any).customer}`}>
                      {(data as any).customer_name || "Customer"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </div>
              </Col>

              <Col sm={12}>
                <div className="text-muted">Description</div>
                <div>{data.description || "—"}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

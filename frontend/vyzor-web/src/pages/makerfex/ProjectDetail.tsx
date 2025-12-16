// src/pages/makerfex/ProjectDetail.tsx
// ============================================================================
// Makerfex Project Detail (Phase 4)
// ----------------------------------------------------------------------------
// Purpose:
// - Render a useful project summary inside the Vyzor shell.
// - Keep styling minimal (React-Bootstrap only).
// - Add relational navigation (Customer link).
// - Add optional relational content: Related Projects (same customer), read-only.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, Col, Row, Spinner, Table } from "react-bootstrap";

import { getProject, listProjects } from "../../api/projects";
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

  const [related, setRelated] = useState<Project[]>([]);
  const [relatedErr, setRelatedErr] = useState<string | null>(null);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Load project
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

  // Load related projects (same customer), excluding this project
  useEffect(() => {
    let alive = true;

    (async () => {
      const customerId = (data as any)?.customer as number | null | undefined;

      // If no customer, no related projects section
      if (!customerId) {
        setRelated([]);
        setRelatedErr(null);
        setRelatedLoading(false);
        return;
      }

      setRelatedLoading(true);
      setRelatedErr(null);

      try {
        const { items } = await listProjects({ customer: customerId });

        if (!alive) return;

        // Exclude this project and keep stable ordering
        const filtered = (items || []).filter((p) => p.id !== projectId);
        setRelated(filtered);
      } catch (e: any) {
        if (!alive) return;
        setRelatedErr(e?.response?.data?.detail || e?.message || "Failed to load related projects");
      } finally {
        if (!alive) return;
        setRelatedLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [data, projectId]);

  const title = useMemo(() => {
    if (!data) return `Project #${id}`;
    return data.name || `Project #${id}`;
  }, [data, id]);

  const customerId = (data as any)?.customer as number | null | undefined;
  const customerName = (data as any)?.customer_name as string | null | undefined;

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
        <Row className="g-3">
          <Col lg={6}>
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
                    {(data as any).priority ? (
                      <Badge bg="info">{(data as any).priority}</Badge>
                    ) : null}
                  </div>
                </div>

                <Row className="mt-3 g-2">
                  <Col sm={6}>
                    <div className="text-muted">Due</div>
                    <div>{formatDate((data as any).due_date)}</div>
                  </Col>

                  <Col sm={6}>
                    <div className="text-muted">Assigned To</div>
                    <div>
                      {(data as any).assigned_to ? (
                        <Link to={`/employees/${(data as any).assigned_to}`}>
                          {(data as any).assigned_to_name || "Employee"}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </div>
                  </Col>

                  <Col sm={12}>
                    <div className="text-muted">Customer</div>
                    <div>
                      {customerId ? (
                        <Link to={`/customers/${customerId}`}>{customerName || "Customer"}</Link>
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
          </Col>

          {/* Related Projects */}
          <Col lg={6}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <h5 className="mb-0">Related Projects</h5>
                  {relatedLoading ? (
                    <div className="d-flex align-items-center gap-2">
                      <Spinner animation="border" size="sm" />
                      <span className="text-muted">Loading…</span>
                    </div>
                  ) : null}
                </div>

                {!customerId ? (
                  <div className="text-muted mt-3">No customer assigned.</div>
                ) : relatedErr ? (
                  <div className="text-danger mt-3">{relatedErr}</div>
                ) : !relatedLoading && related.length === 0 ? (
                  <div className="text-muted mt-3">No other projects for this customer.</div>
                ) : (
                  <div className="mt-3">
                    <Table striped bordered hover responsive size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                          <th>Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {related.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <Link to={`/projects/${p.id}`}>{p.name}</Link>
                            </td>
                            <td>{p.status ?? "—"}</td>
                            <td>{(p as any).assigned_to ? (
                              <Link to={`/employees/${(p as any).assigned_to}`}>
                                {(p as any).assigned_to_name || "Employee"}
                              </Link>
                            ) : (
                              "—"
                            )}
                            </td>
                            <td>{formatDate((p as any).due_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}

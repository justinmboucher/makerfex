// src/pages/makerfex/ProjectDetail.tsx
// ============================================================================
// Makerfex Project Detail (Read-only)
// ----------------------------------------------------------------------------
// Adds embedded Tasks table (server-driven) scoped to this project.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, Col, Row, Spinner, Table } from "react-bootstrap";

import { getProject, listProjects } from "../../api/projects";
import type { Project } from "../../api/projects";
import TasksTable from "../../components/makerfex/TasksTable";

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
        setData(p as any);
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
      if (!customerId) {
        setRelated([]);
        setRelatedErr(null);
        setRelatedLoading(false);
        return;
      }

      setRelatedLoading(true);
      setRelatedErr(null);
      try {
        const { items } = await listProjects({ customer: customerId } as any);
        if (!alive) return;
        const filtered = (items || []).filter((p: any) => p.id !== projectId);
        setRelated(filtered as any);
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
    return (data as any).name || `Project #${id}`;
  }, [data, id]);

  const customerId = (data as any)?.customer as number | null | undefined;
  const customerName = (data as any)?.customer_name as string | null | undefined;
  const canLogSale = Boolean((data as any)?.can_log_sale);
  const stageName = (data as any)?.current_stage_name || (data as any)?.current_stage || "—";

  return (
    <>
      <h3>{title}</h3>

      <Button variant="link" className="p-0 mb-3" onClick={() => history.back()}>
        ← Back
      </Button>

      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" /> <span>Loading…</span>
        </div>
      ) : err ? (
        <div>{err}</div>
      ) : !data ? (
        <div>Not found.</div>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-start">
                <Col md={8}>
                  <h4 className="mb-2">{(data as any).name}</h4>

                  {(data as any).reference_code ? (
                    <div className="text-muted mb-2">Ref: {(data as any).reference_code}</div>
                  ) : null}

                  <div className="mb-3">
                    <Badge bg="primary" className="me-2">
                      {(data as any).status}
                    </Badge>
                    {(data as any).priority ? (
                      <Badge bg="warning" text="dark">
                        {(data as any).priority}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="text-muted">
                    Stage: <strong>{stageName}</strong>
                  </div>
                </Col>

                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Button
                    variant={canLogSale ? "outline-primary" : "outline-secondary"}
                    disabled={!canLogSale}
                    onClick={() => alert("Log Sale is not implemented yet. (Gate is working ✅)")}
                  >
                    Log Sale
                  </Button>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col md={3}>
                  <div className="text-muted">Due</div>
                  <div>{formatDate((data as any).due_date)}</div>
                </Col>
                <Col md={3}>
                  <div className="text-muted">Assigned To</div>
                  <div>
                    {(data as any).assigned_to ? (
                      <span>{(data as any).assigned_to_name || "Employee"}</span>
                    ) : (
                      "—"
                    )}
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-muted">Customer</div>
                  <div>
                    {customerId ? (
                      <Link to={`/customers/${customerId}`}>{customerName || "Customer"}</Link>
                    ) : (
                      "—"
                    )}
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-muted">Description</div>
                  <div>{(data as any).description || "—"}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ✅ Tasks for this project */}
          <TasksTable
            title="Tasks for this project"
            lockedParams={{ project: projectId }}
            showStationFilter={true}
            showStageFilter={true}
            presetStorageKey={`makerfex.project.${projectId}.tasks.tablePresets`}
          />

          {/* Related Projects */}
          <h5 className="mt-4">Related Projects</h5>

          {relatedLoading ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" /> <span>Loading…</span>
            </div>
          ) : !customerId ? (
            <div className="text-muted">No customer assigned.</div>
          ) : relatedErr ? (
            <div>{relatedErr}</div>
          ) : related.length === 0 ? (
            <div className="text-muted">No other projects for this customer.</div>
          ) : (
            <Card className="mt-2">
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {related.map((p: any) => (
                      <tr key={p.id}>
                        <td>
                          <Link to={`/projects/${p.id}`}>{p.name}</Link>
                        </td>
                        <td>{p.status ?? "—"}</td>
                        <td>{p.assigned_to ? p.assigned_to_name || "Employee" : "—"}</td>
                        <td>{formatDate(p.due_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </>
  );
}

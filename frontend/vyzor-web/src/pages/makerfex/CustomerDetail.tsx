// src/pages/makerfex/CustomerDetail.tsx
// ============================================================================
// Makerfex Customer Detail (Phase 4)
// ----------------------------------------------------------------------------
// Purpose:
// - Render a useful customer summary (not raw JSON) inside the Vyzor shell.
// - Keep styling minimal (React-Bootstrap only).
// - Add relational content: read-only list of this customer's projects.
// - No row-click tricks; navigation handled via links.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, Col, Row, Spinner, Table } from "react-bootstrap";

import { getCustomer } from "../../api/customers";
import type { Customer } from "../../api/customers";

import { listProjects, type Project } from "../../api/projects";

function formatAddress(c: Customer) {
  const line1 = (c as any).address_line1 as string | null | undefined;
  const line2 = (c as any).address_line2 as string | null | undefined;
  const city = (c as any).city as string | null | undefined;
  const region = (c as any).region as string | null | undefined;
  const postal = (c as any).postal_code as string | null | undefined;
  const country = (c as any).country_code as string | null | undefined;

  const parts: string[] = [];
  if (line1) parts.push(line1);
  if (line2) parts.push(line2);

  const cityLine = [city, region, postal].filter(Boolean).join(", ");
  if (cityLine) parts.push(cityLine);

  if (country) parts.push(country);

  return parts.length ? parts.join(" · ") : "—";
}

export default function CustomerDetail() {
  const { id } = useParams();
  const customerId = Number(id);

  const [data, setData] = useState<Customer | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsErr, setProjectsErr] = useState<string | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Load customer
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (!Number.isFinite(customerId)) throw new Error("Invalid customer id");
        const c = await getCustomer(customerId);
        if (!alive) return;
        setData(c);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load customer");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [customerId]);

  // Load projects for this customer (read-only)
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!Number.isFinite(customerId)) return;

      setProjectsLoading(true);
      setProjectsErr(null);

      try {
        // Backend filter: /projects/?customer=<id>
        const { items } = await listProjects({ customer: customerId });
        if (!alive) return;
        setProjects(items);
      } catch (e: any) {
        if (!alive) return;
        setProjectsErr(e?.response?.data?.detail || e?.message || "Failed to load projects");
      } finally {
        if (!alive) return;
        setProjectsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [customerId]);

  const title = useMemo(() => {
    if (!data) return `Customer #${id}`;
    const company = (data as any).company_name as string | null | undefined;
    return company ? `${data.name} — ${company}` : data.name || `Customer #${id}`;
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
        <Row className="g-3">
          <Col lg={6}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <h4 className="mb-1">{data.name || "Customer"}</h4>
                    {(data as any).company_name ? (
                      <div className="text-muted">{(data as any).company_name}</div>
                    ) : null}
                  </div>

                  <Badge bg={data.is_vip ? "warning" : "secondary"}>
                    {data.is_vip ? "VIP" : "Standard"}
                  </Badge>
                </div>

                <Row className="mt-3 g-2">
                  <Col sm={6}>
                    <div className="text-muted">Email</div>
                    <div>{data.email || "—"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted">Phone</div>
                    <div>{data.phone || "—"}</div>
                  </Col>
                  <Col sm={12}>
                    <div className="text-muted">Address</div>
                    <div>{formatAddress(data)}</div>
                  </Col>
                  <Col sm={12}>
                    <div className="text-muted">Notes</div>
                    <div>{(data as any).notes || "—"}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <h5 className="mb-0">Projects</h5>
                  {projectsLoading ? (
                    <div className="d-flex align-items-center gap-2">
                      <Spinner animation="border" size="sm" />
                      <span className="text-muted">Loading…</span>
                    </div>
                  ) : null}
                </div>

                {projectsErr ? (
                  <div className="text-danger mt-3">{projectsErr}</div>
                ) : !projectsLoading && projects.length === 0 ? (
                  <div className="text-muted mt-3">No projects for this customer.</div>
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
                        {projects.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <Link to={`/projects/${p.id}`}>{p.name}</Link>
                            </td>
                            <td>{p.status ?? "—"}</td>
                            <td>{p.assigned_to_name ?? "—"}</td>
                            <td>{p.due_date ?? "—"}</td>
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

// src/pages/makerfex/EmployeeDetail.tsx
// ============================================================================
// Makerfex Employee Detail (Phase 4)
// ----------------------------------------------------------------------------
// Purpose:
// - Minimal, read-only employee detail inside the Vyzor shell.
// - Relational content: show projects assigned to this employee.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, Col, Row, Spinner, Table } from "react-bootstrap";

import { getEmployee, type Employee } from "../../api/employees";
import { listProjects, type Project } from "../../api/projects";

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const employeeId = Number(id);

  const [data, setData] = useState<Employee | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsErr, setProjectsErr] = useState<string | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Load employee
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (!Number.isFinite(employeeId)) throw new Error("Invalid employee id");
        const e = await getEmployee(employeeId);
        if (!alive) return;
        setData(e);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load employee");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [employeeId]);

  // Load projects assigned to this employee
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!Number.isFinite(employeeId)) return;

      setProjectsLoading(true);
      setProjectsErr(null);

      try {
        const { items } = await listProjects({ assigned_to: employeeId });
        if (!alive) return;
        setProjects(items);
      } catch (e: any) {
        if (!alive) return;
        setProjectsErr(e?.response?.data?.detail || e?.message || "Failed to load assigned projects");
      } finally {
        if (!alive) return;
        setProjectsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [employeeId]);

  const title = useMemo(() => {
    if (!data) return `Employee #${id}`;
    return `${data.first_name} ${data.last_name || ""}`.trim() || `Employee #${id}`;
  }, [data, id]);

  return (
    <>
      <h3 className="mb-3">{title}</h3>

      <Button variant="link" className="p-0 mb-3" onClick={() => history.back()}>
        &larr; Back
      </Button>

      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading…</span>
        </div>
      ) : err ? (
        <div className="text-danger">{err}</div>
      ) : data ? (
        <Row className="g-3">
          <Col lg={6}>
            <Card>
              <Card.Body>
                <Row className="g-2">
                  <Col sm={6}>
                    <div className="text-muted">Role</div>
                    <div>{data.role || "—"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted">Status</div>
                    <div>{data.is_active ? "Active" : "Inactive"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted">Email</div>
                    <div>{data.email || "—"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted">Manager</div>
                    <div>{data.is_manager ? "Yes" : "No"}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <h5 className="mb-0">Assigned Projects</h5>
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
                  <div className="text-muted mt-3">No projects assigned.</div>
                ) : (
                  <div className="mt-3">
                    <Table striped bordered hover responsive size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Status</th>
                          <th>Customer</th>
                          <th>Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((p: any) => (
                          <tr key={p.id}>
                            <td>
                              <Link to={`/projects/${p.id}`}>{p.name}</Link>
                            </td>
                            <td>{p.status ?? "—"}</td>
                            <td>
                              {p.customer ? (
                                <Link to={`/customers/${p.customer}`}>{p.customer_name || "Customer"}</Link>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>{formatDate(p.due_date)}</td>
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
      ) : null}
    </>
  );
}

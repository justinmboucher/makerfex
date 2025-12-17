// src/pages/makerfex/EmployeeDetail.tsx
// ============================================================================
// Makerfex Employee Detail (Phase 4)
// ----------------------------------------------------------------------------
// Purpose:
// - Minimal, read-only employee detail inside the Vyzor shell.
// - Relational content: show projects assigned to this employee.
// - UX polish: lightweight filtering
//     All / Active / On Hold / Overdue / Completed / Cancelled
// - Visual cue: "Overdue" pill shown next to project name when overdue.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, ButtonGroup, Card, Col, Row, Spinner, Table } from "react-bootstrap";

import { getEmployee, type Employee } from "../../api/employees";
import { listProjects, type Project } from "../../api/projects";

type FilterKey = "all" | "active" | "on_hold" | "overdue" | "completed" | "cancelled";

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

function normStatus(status: any) {
  return String(status ?? "").trim().toLowerCase();
}

function isCompleted(status: any) {
  return normStatus(status) === "completed";
}

function isCancelled(status: any) {
  const s = normStatus(status);
  return s === "cancelled" || s === "canceled";
}

function isOnHold(status: any) {
  const s = normStatus(status);
  return s === "on hold" || s === "on-hold" || s === "hold";
}

function isActiveStatus(status: any) {
  // Future-proof: stages will be treated as active automatically
  return !isCompleted(status) && !isCancelled(status) && !isOnHold(status);
}

function isOverdueProject(p: any) {
  const due = p?.due_date;
  if (!due) return false;

  // Only active projects can be overdue
  if (!isActiveStatus(p?.status)) return false;

  const dueTime = new Date(due).setHours(0, 0, 0, 0);
  const todayTime = new Date().setHours(0, 0, 0, 0);
  return dueTime < todayTime;
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

  const [filter, setFilter] = useState<FilterKey>("all");

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

  const counts = useMemo(() => {
    const all = projects.length;
    const completed = projects.filter((p: any) => isCompleted(p.status)).length;
    const cancelled = projects.filter((p: any) => isCancelled(p.status)).length;
    const on_hold = projects.filter((p: any) => isOnHold(p.status)).length;
    const active = projects.filter((p: any) => isActiveStatus(p.status)).length;
    const overdue = projects.filter((p: any) => isOverdueProject(p)).length;

    return { all, active, on_hold, overdue, completed, cancelled };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const list = projects as any[];

    switch (filter) {
      case "active":
        return list.filter((p) => isActiveStatus(p.status));
      case "on_hold":
        return list.filter((p) => isOnHold(p.status));
      case "overdue":
        return list.filter((p) => isOverdueProject(p));
      case "completed":
        return list.filter((p) => isCompleted(p.status));
      case "cancelled":
        return list.filter((p) => isCancelled(p.status));
      case "all":
      default:
        return list;
    }
  }, [projects, filter]);

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

                {/* Filter controls */}
                {!projectsLoading && !projectsErr ? (
                  <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
                    <ButtonGroup size="sm">
                      <Button
                        variant={filter === "all" ? "primary" : "outline-primary"}
                        onClick={() => setFilter("all")}
                      >
                        All ({counts.all})
                      </Button>
                      <Button
                        variant={filter === "active" ? "primary" : "outline-primary"}
                        onClick={() => setFilter("active")}
                      >
                        Active ({counts.active})
                      </Button>
                      <Button
                        variant={filter === "on_hold" ? "primary" : "outline-primary"}
                        onClick={() => setFilter("on_hold")}
                      >
                        On Hold ({counts.on_hold})
                      </Button>
                      <Button
                        variant={filter === "overdue" ? "primary" : "outline-primary"}
                        onClick={() => setFilter("overdue")}
                      >
                        Overdue ({counts.overdue})
                      </Button>
                      <Button
                        variant={filter === "completed" ? "primary" : "outline-primary"}
                        onClick={() => setFilter("completed")}
                      >
                        Completed ({counts.completed})
                      </Button>
                      <Button
                        variant={filter === "cancelled" ? "primary" : "outline-primary"}
                        onClick={() => setFilter("cancelled")}
                      >
                        Cancelled ({counts.cancelled})
                      </Button>
                    </ButtonGroup>
                  </div>
                ) : null}

                {projectsErr ? (
                  <div className="text-danger mt-3">{projectsErr}</div>
                ) : !projectsLoading && projects.length === 0 ? (
                  <div className="text-muted mt-3">No projects assigned.</div>
                ) : !projectsLoading && filteredProjects.length === 0 ? (
                  <div className="text-muted mt-3">No projects match this filter.</div>
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
                        {filteredProjects.map((p: any) => {
                          const overdue = isOverdueProject(p);

                          return (
                            <tr key={p.id}>
                              <td>
                                <Link to={`/projects/${p.id}`}>{p.name}</Link>
                                {overdue ? (
                                  <Badge bg="danger" className="ms-2" pill>
                                    Overdue
                                  </Badge>
                                ) : null}
                              </td>
                              <td>{p.status ?? "—"}</td>
                              <td>
                                {p.customer ? (
                                  <Link to={`/customers/${p.customer}`}>
                                    {p.customer_name || "Customer"}
                                  </Link>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td>{formatDate(p.due_date)}</td>
                            </tr>
                          );
                        })}
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

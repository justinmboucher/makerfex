// src/pages/makerfex/StationDetail.tsx
// ============================================================================
// Makerfex Station Detail (Read-only)
// ----------------------------------------------------------------------------
// Shows:
// - Station header (code/active/status)
// - Members roster (employees_detail)
// - Assigned Projects (via Projects API filter ?station=<id>)
// Notes:
// - React-Bootstrap layout only
// - No page-specific CSS
// - Read-only
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Card, Spinner, Table } from "react-bootstrap";

import { getStation, type StationDetail as StationDetailType } from "../../api/stations";
import { listProjects } from "../../api/projects";

type ProjectRow = {
  id: number;
  name: string;
  status: string;
  due_date: string | null;

  customer: number | null;
  customer_name: string | null;

  assigned_to: number | null;
  assigned_to_name: string | null;
};

function isCompletedLike(status: string) {
  const s = (status || "").toLowerCase();
  return s.includes("completed") || s === "done";
}

function isCancelledLike(status: string) {
  const s = (status || "").toLowerCase();
  return s.includes("cancel");
}

function isOnHoldLike(status: string) {
  const s = (status || "").toLowerCase();
  return s.includes("hold") || s.includes("on hold");
}

function isOverdue(dueDateISO: string | null, status: string) {
  if (!dueDateISO) return false;
  if (isCompletedLike(status) || isCancelledLike(status)) return false;

  // Compare date-only to avoid timezone weirdness.
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const due = new Date(dueDateISO);
  const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();

  return dueDateOnly < todayDateOnly;
}

function statusBadgeVariant(status: string): string {
  if (isCancelledLike(status)) return "secondary";
  if (isCompletedLike(status)) return "success";
  if (isOnHoldLike(status)) return "warning";
  return "primary"; // default active-ish
}

export default function StationDetail() {
  const { id } = useParams();
  const stationId = Number(id);

  const [item, setItem] = useState<StationDetailType | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const members = useMemo(() => item?.employees_detail ?? [], [item]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        // 1) Station detail (includes employees_detail if backend patch applied)
        const station = await getStation(stationId);
        if (!alive) return;
        setItem(station);

        // 2) Assigned projects for this station (read-only)
        const { items } = await listProjects({ station: stationId });
        if (!alive) return;
        setProjects(items as any);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load station");
        setItem(null);
        setProjects([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [stationId]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h3 className="mb-0">Station Detail</h3>
        <div className="d-flex gap-2">
          {item ? (
            <>
              <Badge bg={item.is_active ? "success" : "secondary"} pill>
                {item.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge bg="light" text="dark" pill>
                Members: {item.employee_count ?? members.length}
              </Badge>
            </>
          ) : null}
        </div>
      </div>

      <Card className="mt-3">
        <Card.Body>
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" /> <span>Loading…</span>
            </div>
          ) : err ? (
            <div className="text-danger">{err}</div>
          ) : !item ? (
            <div>Not found.</div>
          ) : (
            <>
              <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                <div>
                  <h4 className="mb-1">{item.name}</h4>
                  <div className="text-muted">
                    Code: {item.code || "—"} · Station ID: {item.id}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  {item.code ? (
                    <Badge bg="info" pill>
                      {item.code}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {item.description ? <p className="mt-3 mb-0">{item.description}</p> : null}
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mt-3">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="mb-0">Members</h5>
            {item ? (
              <Badge bg="light" text="dark" pill>
                {item.employee_count ?? members.length} total
              </Badge>
            ) : null}
          </div>

          <div className="mt-3">
            {loading ? null : members.length === 0 ? (
              <div>No employees assigned to this station.</div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <Link to={`/employees/${m.id}`}>{m.display_name || `Employee #${m.id}`}</Link>
                      </td>
                      <td>{m.role || "—"}</td>
                      <td>
                        <Badge bg={m.is_active ? "success" : "secondary"} pill>
                          {m.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-3">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="mb-0">Assigned Projects</h5>
            {!loading ? (
              <Badge bg="light" text="dark" pill>
                {projects.length} total
              </Badge>
            ) : null}
          </div>

          <div className="mt-3">
            {loading ? null : projects.length === 0 ? (
              <div>No projects assigned to this station.</div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Customer</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const overdue = isOverdue(p.due_date, p.status);
                    const badgeVariant = statusBadgeVariant(p.status);

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <Link to={`/projects/${p.id}`}>{p.name}</Link>
                            {overdue ? (
                              <Badge bg="danger" pill>
                                Overdue
                              </Badge>
                            ) : null}
                          </div>
                        </td>

                        <td>
                          {p.customer ? (
                            <Link to={`/customers/${p.customer}`}>{p.customer_name ?? `Customer #${p.customer}`}</Link>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          {p.assigned_to ? (
                            <Link to={`/employees/${p.assigned_to}`}>
                              {p.assigned_to_name ?? `Employee #${p.assigned_to}`}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          <Badge bg={badgeVariant} pill>
                            {p.status || "—"}
                          </Badge>
                        </td>

                        <td>{p.due_date || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

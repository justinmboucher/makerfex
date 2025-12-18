// src/pages/makerfex/Projects.tsx
// ============================================================================
// Makerfex Projects Page (Vyzor Shell)
// ----------------------------------------------------------------------------
// Read-only Projects list with URL-persisted filters:
//   - ?station=<id>
//   - ?customer=<id>
//   - ?assigned_to=<employee_id>
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { Table, Spinner, Badge, Button, Form } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { listProjects } from "../../api/projects";
import type { Project } from "../../api/projects";

import { listStations, type Station } from "../../api/stations";
import { listEmployees, type Employee } from "../../api/employees";

// Adjust if your customers API exports different names/types.
import { listCustomers, type Customer } from "../../api/customers";

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

function cleanIdParam(v: string | null): string {
  if (!v) return "";
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? String(n) : "";
}

function unwrapItems<T>(data: any): T[] {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.results)) return data.results;
      return [];
    }

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [stations, setStations] = useState<Station[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Keep as strings for <select>
  const [stationId, setStationId] = useState<string>(() => cleanIdParam(searchParams.get("station")));
  const [customerId, setCustomerId] = useState<string>(() => cleanIdParam(searchParams.get("customer")));
  const [assignedToId, setAssignedToId] = useState<string>(() => cleanIdParam(searchParams.get("assigned_to")));

  const navigate = useNavigate();

  // Prevent “URL sync” effect from overwriting initial state during first render
  const didInitFromUrl = useRef(false);

  // If user navigates back/forward and query params change, reflect them in state
  useEffect(() => {
    const nextStation = cleanIdParam(searchParams.get("station"));
    const nextCustomer = cleanIdParam(searchParams.get("customer"));
    const nextAssigned = cleanIdParam(searchParams.get("assigned_to"));

    // Avoid pointless state churn
    if (nextStation !== stationId) setStationId(nextStation);
    if (nextCustomer !== customerId) setCustomerId(nextCustomer);
    if (nextAssigned !== assignedToId) setAssignedToId(nextAssigned);

    didInitFromUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load filter option lists once (non-fatal if any fail)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [stationsRes, employeesRes, customersRes] = await Promise.all([
          listStations(),
          listEmployees({ with_counts: 0 } as any),
          listCustomers(),
        ]);

        if (!alive) return;

        setStations(unwrapItems<Station>(stationsRes));
        setEmployees(unwrapItems<Employee>(employeesRes));
        setCustomers(unwrapItems<Customer>(customersRes));
      } catch {
        if (!alive) return;
        setStations([]);
        setEmployees([]);
        setCustomers([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Push filter state into the URL (bookmarkable/shareable)
  useEffect(() => {
    // Wait until we've processed URL at least once (prevents weird first paint)
    if (!didInitFromUrl.current) return;

    const next = new URLSearchParams(searchParams);

    const setOrDelete = (key: string, val: string) => {
      if (val) next.set(key, val);
      else next.delete(key);
    };

    setOrDelete("station", stationId);
    setOrDelete("customer", customerId);
    setOrDelete("assigned_to", assignedToId);

    // Only update if something actually changed (prevents infinite loops)
    const currentStr = searchParams.toString();
    const nextStr = next.toString();
    if (currentStr !== nextStr) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, customerId, assignedToId]);

  // Fetch projects whenever filters change
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const params: Record<string, any> = {};
        if (stationId) params.station = Number(stationId);
        if (customerId) params.customer = Number(customerId);
        if (assignedToId) params.assigned_to = Number(assignedToId);

        const { items } = await listProjects(params);

        if (!alive) return;
        setItems(items);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load projects");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [stationId, customerId, assignedToId]);

  const rows = useMemo(() => items, [items]);

  const employeeLabel = (e: Employee) => {
    const anyE: any = e as any;
    return (
      anyE.display_name ||
      `${anyE.first_name ?? ""} ${anyE.last_name ?? ""}`.trim() ||
      anyE.email ||
      `Employee #${anyE.id}`
    );
  };

  const customerLabel = (c: Customer) => {
    const anyC: any = c as any;
    return anyC.name || anyC.display_name || `Customer #${anyC.id}`;
  };

  function clearFilters() {
    setStationId("");
    setCustomerId("");
    setAssignedToId("");
    setSearchParams({}, { replace: true });
  }

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Makerfex Projects</h3>
          <div style={{ opacity: 0.7, marginTop: 4 }}>{rows.length} loaded</div>
        </div>

        <div style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
          <Form.Group style={{ minWidth: 220 }} controlId="projectsStationFilter">
            <Form.Label style={{ marginBottom: 4 }}>Station</Form.Label>
            <Form.Select value={stationId} onChange={(e) => setStationId(e.target.value)}>
              <option value="">All stations</option>
              {stations.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group style={{ minWidth: 220 }} controlId="projectsCustomerFilter">
            <Form.Label style={{ marginBottom: 4 }}>Customer</Form.Label>
            <Form.Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">All customers</option>
              {customers.map((c) => (
                <option key={(c as any).id} value={String((c as any).id)}>
                  {customerLabel(c)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group style={{ minWidth: 220 }} controlId="projectsAssignedFilter">
            <Form.Label style={{ marginBottom: 4 }}>Assigned To</Form.Label>
            <Form.Select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
              <option value="">Anyone</option>
              {employees.map((e) => (
                <option key={(e as any).id} value={String((e as any).id)}>
                  {employeeLabel(e)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ marginBottom: 4 }}>&nbsp;</Form.Label>
            <Button
                variant="outline-secondary"
                onClick={clearFilters}
                disabled={!stationId && !customerId && !assignedToId}
              >
              Clear filters
            </Button>
          </Form.Group>
        </div>
      </div>

      {loading && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner animation="border" size="sm" />
          <span>Loading projects…</span>
        </div>
      )}

      {err && <div style={{ marginTop: 16, color: "crimson" }}>{err}</div>}

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

                  <td>
                    {p.customer ? (
                      <Link to={`/customers/${p.customer}`}>{p.customer_name ?? `Customer #${p.customer}`}</Link>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>
                    {p.assigned_to ? (
                      <Link to={`/employees/${p.assigned_to}`}>{p.assigned_to_name ?? `Employee #${p.assigned_to}`}</Link>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <Button size="sm" variant="outline-primary" onClick={() => navigate(`/projects/${p.id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", opacity: 0.7, padding: 24 }}>
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

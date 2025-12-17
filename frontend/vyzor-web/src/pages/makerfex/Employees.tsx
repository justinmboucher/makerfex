// src/pages/makerfex/Employees.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Spinner, Table } from "react-bootstrap";
import { listEmployees, type Employee } from "../../api/employees";

export default function Employees() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { items } = await listEmployees({ with_counts: 1 });
        if (!alive) return;
        setItems(items);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load employees");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <h3 className="mb-3">Employees</h3>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" />
              <span>Loading…</span>
            </div>
          ) : err ? (
            <div className="text-danger">{err}</div>
          ) : items.length === 0 ? (
            <div className="text-muted">No employees found.</div>
          ) : (
            <Table striped bordered hover responsive size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Workload</th>
                  <th>Overdue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => {
                  const name = `${e.first_name} ${e.last_name || ""}`.trim();
                  return (
                    <tr key={e.id}>
                      <td>
                        <Link to={`/employees/${e.id}`}>{name || `Employee #${e.id}`}</Link>
                      </td>
                      <td>{e.role || "—"}</td>
                      <td>{e.email || "—"}</td>
                      <td>
                        <Link to={`/employees/${e.id}`}>
                          {(e as any).assigned_project_count ?? 0}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/employees/${e.id}`}>
                          {(e as any).overdue_project_count ?? 0}
                        </Link>
                      </td>
                      <td>{e.is_active ? "Active" : "Inactive"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

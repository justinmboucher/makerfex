// src/pages/makerfex/Stations.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Spinner, Table } from "react-bootstrap";
import { listStations, type Station } from "../../api/stations";

export default function Stations() {
  const [items, setItems] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { items } = await listStations();
        if (!alive) return;
        setItems(items);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load stations");
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
      <h3>Stations</h3>

      <Card className="mt-3">
        <Card.Body>
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" /> <span>Loading…</span>
            </div>
          ) : err ? (
            <div className="text-danger">{err}</div>
          ) : items.length === 0 ? (
            <div>No stations found.</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Members</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/stations/${s.id}`}>{s.name || `Station #${s.id}`}</Link>
                    </td>
                    <td>{s.code || "—"}</td>
                    <td>{s.employee_count ?? (s.employees?.length ?? 0)}</td>
                    <td>{s.is_active ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

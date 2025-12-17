// src/pages/makerfex/StationDetail.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Spinner, Table } from "react-bootstrap";
import { getStation, type StationDetail } from "../../api/stations";

export default function StationDetail() {
  const { id } = useParams();
  const stationId = Number(id);

  const [item, setItem] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getStation(stationId);
        if (!alive) return;
        setItem(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load station");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [stationId]);

  const members = item?.employees_detail ?? [];

  return (
    <>
      <h3>Station Detail</h3>

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
              <h4 className="mb-1">{item.name}</h4>
              <div className="text-muted">
                Code: {item.code || "—"} · Status: {item.is_active ? "Active" : "Inactive"} · Members:{" "}
                {item.employee_count ?? members.length}
              </div>

              {item.description ? <p className="mt-3 mb-0">{item.description}</p> : null}
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mt-3">
        <Card.Body>
          <h5 className="mb-3">Members</h5>

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
                    <td>{m.is_active ? "Active" : "Inactive"}</td>
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

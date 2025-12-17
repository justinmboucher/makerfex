// src/pages/makerfex/EmployeeDetail.tsx

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getEmployee, type Employee } from "../../api/employees";

export default function EmployeeDetail() {
  const { id } = useParams();
  const employeeId = Number(id);

  const [data, setData] = useState<Employee | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      ) : null}
    </>
  );
}

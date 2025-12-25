// src/pages/makerfex/SalesDetail.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, Table } from "react-bootstrap";
import { getSalesOrder, type SalesOrder } from "../../api/sales";

export default function SalesDetail() {
  const { id } = useParams();
  const saleId = Number(id);

  const [data, setData] = useState<SalesOrder | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (!Number.isFinite(saleId)) throw new Error("Invalid sale id");
        const o = await getSalesOrder(saleId);
        if (!alive) return;
        setData(o);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load sale");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [saleId]);

  if (loading) return <div>Loading…</div>;
  if (err) return <Alert variant="danger">{err}</Alert>;
  if (!data) return <Alert variant="warning">Sale not found.</Alert>;

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h4 className="mb-1">
              Sales Order {data.order_number || `#${data.id}`}{" "}
              <Badge bg="secondary" className="ms-2">{data.status}</Badge>
            </h4>
            <div className="text-muted">
              Date: {data.order_date ? new Date(data.order_date).toLocaleDateString() : "—"} • Source:{" "}
              {data.source}
            </div>
            <div className="text-muted">
              Project: {data.project ? `#${data.project}` : "—"} • Customer:{" "}
              {data.customer ? `#${data.customer}` : "—"}
            </div>
          </div>

          <Button as={Link as any} to="/sales" variant="outline-secondary" size="sm">
            Back to Sales
          </Button>
        </div>

        <Table responsive size="sm" hover>
          <thead>
            <tr>
              <th>Description</th>
              <th className="text-end">Qty</th>
              <th className="text-end">Unit Price</th>
              <th className="text-end">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {(data.lines || []).length === 0 ? (
              <tr><td colSpan={4}>No line items.</td></tr>
            ) : (
              (data.lines || []).map((ln) => (
                <tr key={ln.id}>
                  <td>{ln.description}</td>
                  <td className="text-end">{ln.quantity}</td>
                  <td className="text-end">{ln.unit_price}</td>
                  <td className="text-end">{ln.line_total ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <div className="d-flex justify-content-end mt-3">
          <div style={{ minWidth: 260 }}>
            <div className="d-flex justify-content-between">
              <div>Subtotal</div>
              <div>{data.subtotal_amount ?? "—"}</div>
            </div>
            <div className="d-flex justify-content-between">
              <div>Tax</div>
              <div>{data.tax_amount ?? "—"}</div>
            </div>
            <div className="d-flex justify-content-between fw-bold">
              <div>Total</div>
              <div>{data.total_amount ?? "—"}</div>
            </div>
          </div>
        </div>

        {data.notes ? (
          <div className="mt-3">
            <div className="fw-semibold">Notes</div>
            <div className="text-muted">{data.notes}</div>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}

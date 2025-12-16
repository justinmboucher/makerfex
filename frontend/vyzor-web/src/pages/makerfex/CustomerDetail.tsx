// src/pages/makerfex/CustomerDetail.tsx
// ============================================================================
// Makerfex Customer Detail (Phase 4)
// ----------------------------------------------------------------------------
// Purpose:
// - Render a useful customer summary (not raw JSON) inside the Vyzor shell.
// - Keep styling minimal (React-Bootstrap only).
// - No row-click tricks; navigation handled elsewhere.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { getCustomer } from "../../api/customers";
import type { Customer } from "../../api/customers";

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

  const title = useMemo(() => {
    if (!data) return `Customer #${id}`;
    const company = (data as any).company_name as string | null | undefined;
    return company ? `${data.name} — ${company}` : data.name || `Customer #${id}`;
  }, [data, id]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <Button variant="outline-secondary" size="sm" onClick={() => history.back()}>
          Back
        </Button>
      </div>

      {loading && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner animation="border" size="sm" />
          <span>Loading…</span>
        </div>
      )}

      {err && <div style={{ marginTop: 16, color: "crimson" }}>{err}</div>}

      {!loading && !err && data && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <Card>
            <Card.Body>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{data.name || "Customer"}</div>
                  {(data as any).company_name ? (
                    <div style={{ opacity: 0.75 }}>{(data as any).company_name}</div>
                  ) : null}
                </div>
                <div>
                  {data.is_vip ? <Badge bg="warning">VIP</Badge> : <Badge bg="secondary">Standard</Badge>}
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Email</div>
                  <div>{data.email || "—"}</div>
                </Col>
                <Col md={6}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Phone</div>
                  <div>{data.phone || "—"}</div>
                </Col>

                <Col md={12}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Address</div>
                  <div>{formatAddress(data)}</div>
                </Col>

                <Col md={12}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Notes</div>
                  <div>{(data as any).notes || "—"}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}

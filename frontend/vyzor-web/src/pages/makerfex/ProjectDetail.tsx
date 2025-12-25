// src/pages/makerfex/ProjectDetail.tsx
// ============================================================================
// Makerfex Project Detail
// ----------------------------------------------------------------------------
// Adds:
// - Read-only BOM snapshots display (materials/consumables/equipment)
// - Log usage (calls /api/inventory/consume/ with BOM snapshot provenance)
// - Log Sale via reusable LogSaleModal (POST /api/sales/orders/log_from_project/) ✅ Commit C
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";

import { getProject, listProjects } from "../../api/projects";
import type {
  Project,
  ProjectConsumableSnapshot,
  ProjectEquipmentSnapshot,
  ProjectMaterialSnapshot,
} from "../../api/projects";

import { consumeInventory, listInventoryTransactions } from "../../api/inventory";
import type { InventoryType, InventoryTransaction } from "../../api/inventory";

import LogSaleModal from "../../components/makerfex/LogSaleModal";

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const projectId = Number(id);

  const [data, setData] = useState<Project | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [related, setRelated] = useState<Project[]>([]);
  const [relatedErr, setRelatedErr] = useState<string | null>(null);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const [usageMsg, setUsageMsg] = useState<string | null>(null);
  const [usageErr, setUsageErr] = useState<string | null>(null);
  const [usageBusy, setUsageBusy] = useState(false);

  const [ledger, setLedger] = useState<InventoryTransaction[]>([]);
  const [ledgerBusy, setLedgerBusy] = useState(false);
  const [ledgerErr, setLedgerErr] = useState<string | null>(null);

  // Per-snapshot input amounts (string so we don't fight FormControl)
  const [consumeInputs, setConsumeInputs] = useState<Record<string, string>>({});

  // ---- Log Sale (reusable modal) ------------------------------------------
  const [showSaleModal, setShowSaleModal] = useState(false);
  // -------------------------------------------------------------------------

  // Load project
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        if (!Number.isFinite(projectId)) throw new Error("Invalid project id");
        const p = await getProject(projectId);
        if (!alive) return;
        setData(p);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load project");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId]);

  // Load related projects (same customer), excluding this project
  useEffect(() => {
    let alive = true;

    (async () => {
      const customerId = data?.customer ?? null;

      if (!customerId) {
        setRelated([]);
        setRelatedErr(null);
        setRelatedLoading(false);
        return;
      }

      setRelatedLoading(true);
      setRelatedErr(null);

      try {
        const { items } = await listProjects({ customer: customerId });
        if (!alive) return;
        setRelated((items || []).filter((p) => p.id !== projectId));
      } catch (e: any) {
        if (!alive) return;
        setRelatedErr(
          e?.response?.data?.detail || e?.message || "Failed to load related projects"
        );
      } finally {
        if (!alive) return;
        setRelatedLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [data, projectId]);

  // Load ledger (transactions scoped to this project)
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!Number.isFinite(projectId)) return;

      setLedgerBusy(true);
      setLedgerErr(null);

      try {
        const { items } = await listInventoryTransactions({
          project: projectId,
          ordering: "-created_at",
        });
        if (!alive) return;
        setLedger(items || []);
      } catch (e: any) {
        if (!alive) return;
        setLedgerErr(
          e?.response?.data?.detail || e?.message || "Failed to load inventory ledger"
        );
      } finally {
        if (!alive) return;
        setLedgerBusy(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId]);

  const title = useMemo(() => {
    if (!data) return `Project #${id}`;
    return data.name || `Project #${id}`;
  }, [data, id]);

  const customerId = data?.customer ?? null;
  const customerName = (data as any)?.customer_name ?? null; // keep compatible with your serializer output
  const canLogSale = Boolean((data as any)?.can_log_sale);
  const stageName =
    ((data as any)?.current_stage_name as any) ||
    ((data as any)?.current_stage as any) ||
    "—";
  const stationId = toNum((data as any)?.station);

  function snapshotKey(kind: InventoryType, snapshotId: number) {
    return `${kind}:${snapshotId}`;
  }

  async function handleConsumeFromSnapshot(opts: {
    kind: InventoryType;
    snapshotId: number;
    inventoryId: number | null;
    defaultQty?: string;
  }) {
    setUsageMsg(null);
    setUsageErr(null);

    if (!data) return;

    const key = snapshotKey(opts.kind, opts.snapshotId);
    const qty = (consumeInputs[key] ?? opts.defaultQty ?? "").trim();

    if (!qty) {
      setUsageErr("Enter a quantity to log.");
      return;
    }
    if (!opts.inventoryId) {
      setUsageErr("This snapshot is not linked to an inventory item (missing ID).");
      return;
    }

    setUsageBusy(true);

    try {
      const res = await consumeInventory({
        inventory_type: opts.kind,
        inventory_id: opts.inventoryId,
        quantity: qty,
        project_id: data.id,
        station_id: stationId ?? undefined,
        bom_snapshot_type: opts.kind,
        bom_snapshot_id: opts.snapshotId,
        notes: "",
      });

      setUsageMsg((res as any)?.detail || "Usage logged.");

      // Refresh ledger
      const { items } = await listInventoryTransactions({
        project: data.id,
        ordering: "-created_at",
      });
      setLedger(items || []);

      // Clear input
      setConsumeInputs((prev) => ({ ...prev, [key]: "" }));
    } catch (e: any) {
      setUsageErr(e?.response?.data?.detail || e?.message || "Failed to log usage");
    } finally {
      setUsageBusy(false);
    }
  }

  function renderSnapshotTable(kind: InventoryType) {
    if (!data) return null;

    const rows =
      kind === "material"
        ? ((data as any).material_snapshots || []) as ProjectMaterialSnapshot[]
        : kind === "consumable"
        ? ((data as any).consumable_snapshots || []) as ProjectConsumableSnapshot[]
        : (((data as any).equipment_snapshots || []) as ProjectEquipmentSnapshot[]);

    const label =
      kind === "material" ? "Materials" : kind === "consumable" ? "Consumables" : "Equipment";

    if (!rows.length) {
      return (
        <>
          <h5 className="mt-3">{label}</h5>
          <div className="text-muted">No snapshots.</div>
        </>
      );
    }

    return (
      <>
        <h5 className="mt-3">{label}</h5>

        <Table responsive size="sm" hover>
          <thead>
            <tr>
              <th>Item</th>
              <th>Planned</th>
              <th>Unit</th>
              <th>Unit Cost</th>
              <th style={{ width: 220 }}>Log Usage</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r: any) => {
              const snapId = r.id as number;
              const key = snapshotKey(kind, snapId);

              const itemName =
                kind === "material"
                  ? r.material_name
                  : kind === "consumable"
                  ? r.consumable_name
                  : r.equipment_name;

              const inventoryId =
                kind === "material"
                  ? (r.material as number | null)
                  : kind === "consumable"
                  ? (r.consumable as number | null)
                  : (r.equipment as number | null);

              const planned = r.quantity ?? "—";
              const unit = r.unit ?? "—";
              const unitCost = r.unit_cost_snapshot ?? "—";

              return (
                <tr key={`${kind}-${snapId}`}>
                  <td>
                    <div className="fw-semibold">{itemName}</div>
                    {!inventoryId ? (
                      <div className="text-muted">No inventory link</div>
                    ) : (
                      <div className="text-muted">Inventory ID: {inventoryId}</div>
                    )}
                  </td>
                  <td>{planned}</td>
                  <td>{unit}</td>
                  <td>{unitCost}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Form.Control
                        size="sm"
                        placeholder="Qty"
                        value={consumeInputs[key] ?? ""}
                        onChange={(e) =>
                          setConsumeInputs((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        disabled={usageBusy}
                        style={{ maxWidth: 140 }}
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={usageBusy || !inventoryId}
                        onClick={() =>
                          handleConsumeFromSnapshot({
                            kind,
                            snapshotId: snapId,
                            inventoryId,
                          })
                        }
                      >
                        {usageBusy ? "…" : "Log"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button variant="link" className="p-0" onClick={() => history.back()}>
          ← Back
        </Button>
        <h4 className="mb-0">{title}</h4>
      </div>

      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner size="sm" />
          <div>Loading…</div>
        </div>
      ) : err ? (
        <Alert variant="danger">{err}</Alert>
      ) : !data ? (
        <Alert variant="warning">Not found.</Alert>
      ) : (
        <>
          <Card className="mb-3">
            <Card.Body>
              <Row className="align-items-start">
                <Col>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <h5 className="mb-0">{data.name}</h5>

                    {(data as any).reference_code ? (
                      <Badge bg="light" text="dark">
                        Ref: {(data as any).reference_code}
                      </Badge>
                    ) : null}

                    <Badge bg="secondary">{(data as any).status}</Badge>

                    {(data as any).priority ? (
                      <Badge bg="warning" text="dark">
                        {(data as any).priority}
                      </Badge>
                    ) : null}

                    <span className="text-muted">Stage: {stageName}</span>
                  </div>

                  <div className="text-muted mb-2">{(data as any).description || "—"}</div>

                  <Row className="g-2">
                    <Col md={4}>
                      <div className="text-muted">Due</div>
                      <div>{formatDate((data as any).due_date)}</div>
                    </Col>
                    <Col md={4}>
                      <div className="text-muted">Assigned To</div>
                      <div>
                        {(data as any).assigned_to
                          ? (data as any).assigned_to_name || "Employee"
                          : "—"}
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-muted">Customer</div>
                      <div>
                        {customerId ? (
                          <Link to={`/customers/${customerId}`}>{customerName || "Customer"}</Link>
                        ) : (
                          "—"
                        )}
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col md="auto" className="mt-2 mt-md-0">
                  <div className="d-flex gap-2 justify-content-md-end">
                    {canLogSale ? (
                      <Button variant="success" size="sm" onClick={() => setShowSaleModal(true)}>
                        Log Sale
                      </Button>
                    ) : (
                      <Button variant="outline-secondary" size="sm" disabled>
                        Log Sale
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {usageMsg ? <Alert variant="success">{usageMsg}</Alert> : null}
          {usageErr ? <Alert variant="danger">{usageErr}</Alert> : null}

          <Card className="mb-3">
            <Card.Body>
              <h5 className="mb-2">BOM Snapshots</h5>
              {renderSnapshotTable("material")}
              {renderSnapshotTable("consumable")}
              {renderSnapshotTable("equipment")}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <h5 className="mb-2">Inventory Ledger (This Project)</h5>

              {ledgerBusy ? (
                <div className="d-flex align-items-center gap-2">
                  <Spinner size="sm" />
                  <div>Loading ledger…</div>
                </div>
              ) : ledgerErr ? (
                <Alert variant="danger">{ledgerErr}</Alert>
              ) : ledger.length === 0 ? (
                <div className="text-muted">No inventory transactions logged for this project.</div>
              ) : (
                <Table responsive size="sm" hover>
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Type</th>
                      <th>Delta</th>
                      <th>Reason</th>
                      <th>Snapshot</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((t) => (
                      <tr key={t.id}>
                        <td>{new Date(t.created_at).toLocaleString()}</td>
                        <td>{t.inventory_type}</td>
                        <td>{t.quantity_delta}</td>
                        <td>{t.reason}</td>
                        <td>
                          {t.bom_snapshot_type && t.bom_snapshot_id
                            ? `${t.bom_snapshot_type} #${t.bom_snapshot_id}`
                            : "—"}
                        </td>
                        <td>{t.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              <div className="mt-3">
                <Link to={`/tasks?project=${data.id}`}>View Tasks for this project</Link>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h5 className="mb-2">Related Projects</h5>

              {relatedLoading ? (
                <div className="d-flex align-items-center gap-2">
                  <Spinner size="sm" />
                  <div>Loading…</div>
                </div>
              ) : !customerId ? (
                <div className="text-muted">No customer assigned.</div>
              ) : relatedErr ? (
                <Alert variant="danger">{relatedErr}</Alert>
              ) : related.length === 0 ? (
                <div className="text-muted">No other projects for this customer.</div>
              ) : (
                <Table responsive size="sm" hover>
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Assigned</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {related.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Link to={`/projects/${p.id}`}>{p.name}</Link>
                        </td>
                        <td>{(p as any).status ?? "—"}</td>
                        <td>
                          {(p as any).assigned_to ? (p as any).assigned_to_name || "Employee" : "—"}
                        </td>
                        <td>{formatDate((p as any).due_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
          <LogSaleModal
            show={showSaleModal}
            onHide={() => setShowSaleModal(false)}
            projectId={data?.id ?? null}
            projectName={data?.name ?? null}
            project={data}          // ✅ add this
            onSuccess={(order) => navigate(`/sales/${order.id}`)}
          />
        </>
      )}
    </>
  );
}

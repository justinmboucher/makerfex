// src/pages/makerfex/ProjectDetail.tsx
// ============================================================================
// Makerfex Project Detail
// ----------------------------------------------------------------------------
// Adds:
// - Read-only BOM snapshots display (materials/consumables/equipment)
// - Log usage (calls /api/inventory/consume/ with BOM snapshot provenance)
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

import TasksTable from "../../components/makerfex/TasksTable";

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
        setRelatedErr(e?.response?.data?.detail || e?.message || "Failed to load related projects");
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
        const { items } = await listInventoryTransactions({ project: projectId, ordering: "-created_at" });
        if (!alive) return;
        setLedger(items || []);
      } catch (e: any) {
        if (!alive) return;
        setLedgerErr(e?.response?.data?.detail || e?.message || "Failed to load inventory ledger");
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
  const customerName = data?.customer_name ?? null;

  const canLogSale = Boolean(data?.can_log_sale);
  const stageName = (data?.current_stage_name as any) || (data?.current_stage as any) || "—";

  const stationId = toNum(data?.station);

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

      setUsageMsg(res?.detail || "Usage logged.");

      // Refresh ledger
      const { items } = await listInventoryTransactions({ project: data.id, ordering: "-created_at" });
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
        ? (data.material_snapshots || []) as ProjectMaterialSnapshot[]
        : kind === "consumable"
          ? (data.consumable_snapshots || []) as ProjectConsumableSnapshot[]
          : (data.equipment_snapshots || []) as ProjectEquipmentSnapshot[];

    const title =
      kind === "material" ? "Materials" : kind === "consumable" ? "Consumables" : "Equipment";

    if (!rows.length) {
      return (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title className="mb-2">{title}</Card.Title>
            <div className="text-muted">No snapshots.</div>
          </Card.Body>
        </Card>
      );
    }

    return (
      <Card className="mb-3">
        <Card.Body>
          <Card.Title className="mb-2">{title}</Card.Title>

          <div className="table-responsive">
            <Table size="sm" bordered hover className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Item</th>
                  <th style={{ width: "12%" }}>Planned</th>
                  <th style={{ width: "12%" }}>Unit</th>
                  <th style={{ width: "16%" }}>Unit Cost</th>
                  <th style={{ width: "28%" }}>Log Usage</th>
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
                    kind === "material" ? (r.material as number | null)
                      : kind === "consumable" ? (r.consumable as number | null)
                        : (r.equipment as number | null);

                  const planned = r.quantity ?? "—";
                  const unit = r.unit ?? "—";
                  const unitCost = r.unit_cost_snapshot ?? "—";

                  return (
                    <tr key={key}>
                      <td>
                        <div className="fw-semibold">{itemName}</div>
                        {!inventoryId ? (
                          <div className="text-muted small">No inventory link</div>
                        ) : (
                          <div className="text-muted small">Inventory ID: {inventoryId}</div>
                        )}
                      </td>
                      <td>{planned}</td>
                      <td>{unit}</td>
                      <td>{unitCost}</td>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <Form.Control
                            size="sm"
                            placeholder="qty"
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
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <h3 className="mb-3">{title}</h3>

      <Button variant="link" className="p-0 mb-3" onClick={() => history.back()}>
        ← Back
      </Button>

      {loading ? (
        <Spinner animation="border" />
      ) : err ? (
        <Alert variant="danger">{err}</Alert>
      ) : !data ? (
        <Alert variant="warning">Not found.</Alert>
      ) : (
        <>
          <Card className="mb-3">
            <Card.Body>
              <Row className="g-3">
                <Col md={8}>
                  <h4 className="mb-1">{data.name}</h4>
                  {data.reference_code ? <div className="text-muted">Ref: {data.reference_code}</div> : null}

                  <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
                    <Badge bg="secondary">{data.status}</Badge>
                    {data.priority ? <Badge bg="info">{data.priority}</Badge> : null}
                    <Badge bg="light" text="dark">
                      Stage: {stageName}
                    </Badge>
                    {canLogSale ? (
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => alert("Log Sale is not implemented yet. (Gate is working ✅)")}
                      >
                        Log Sale
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline-secondary" disabled>
                        Log Sale
                      </Button>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="text-muted small mb-1">Description</div>
                    <div>{data.description || "—"}</div>
                  </div>
                </Col>

                <Col md={4}>
                  <Table size="sm" borderless className="mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted">Due</td>
                        <td className="text-end">{formatDate(data.due_date)}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Assigned To</td>
                        <td className="text-end">{data.assigned_to ? data.assigned_to_name || "Employee" : "—"}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Customer</td>
                        <td className="text-end">
                          {customerId ? (
                            <Link to={`/makerfex/customers/${customerId}`}>{customerName || "Customer"}</Link>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {usageMsg ? <Alert variant="success">{usageMsg}</Alert> : null}
          {usageErr ? <Alert variant="danger">{usageErr}</Alert> : null}

          <h5 className="mt-4 mb-2">BOM Snapshots</h5>
          {renderSnapshotTable("material")}
          {renderSnapshotTable("consumable")}
          {renderSnapshotTable("equipment")}

          <h5 className="mt-4 mb-2">Inventory Ledger (This Project)</h5>
          <Card className="mb-4">
            <Card.Body>
              {ledgerBusy ? (
                <Spinner animation="border" />
              ) : ledgerErr ? (
                <Alert variant="danger">{ledgerErr}</Alert>
              ) : ledger.length === 0 ? (
                <div className="text-muted">No inventory transactions logged for this project.</div>
              ) : (
                <div className="table-responsive">
                  <Table size="sm" bordered hover className="mb-0">
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
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ✅ Tasks for this project */}
          <Link to={`/makerfex/tasks?project=${projectId}`}>View Tasks for this project</Link>

          <h5 className="mt-4 mb-2">Related Projects</h5>
          <Card className="mb-4">
            <Card.Body>
              {relatedLoading ? (
                <Spinner animation="border" />
              ) : !customerId ? (
                <div className="text-muted">No customer assigned.</div>
              ) : relatedErr ? (
                <Alert variant="danger">{relatedErr}</Alert>
              ) : related.length === 0 ? (
                <div className="text-muted">No other projects for this customer.</div>
              ) : (
                <div className="table-responsive">
                  <Table size="sm" bordered hover className="mb-0">
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
                            <Link to={`/makerfex/projects/${p.id}`}>{p.name}</Link>
                          </td>
                          <td>{p.status ?? "—"}</td>
                          <td>{p.assigned_to ? p.assigned_to_name || "Employee" : "—"}</td>
                          <td>{formatDate(p.due_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
}

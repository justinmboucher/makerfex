// src/pages/makerfex/InventoryDetail.tsx
// ============================================================================
// Inventory Detail (Read-only)
// ----------------------------------------------------------------------------
// Purpose:
// - Show a single inventory item (material/consumable/equipment)
// - Show full transaction history using a server-driven ledger table
// ============================================================================
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Badge, Card, Spinner } from "react-bootstrap";

import {
  getMaterial,
  getConsumable,
  getEquipment,
  type InventoryType,
  type Material,
  type Consumable,
  type Equipment,
} from "../../api/inventory";

import InventoryLedgerTable from "../../components/makerfex/InventoryLedgerTable";

type Item = Material | Consumable | Equipment;

function asInventoryType(s: string | undefined): InventoryType | null {
  if (s === "material" || s === "consumable" || s === "equipment") return s;
  return null;
}

export default function InventoryDetail() {
  const { inventoryType, id } = useParams();
  const invType = asInventoryType(inventoryType);
  const itemId = Number(id);

  const [item, setItem] = useState<Item | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      setItem(null);
      try {
        if (!invType) throw new Error("Invalid inventory type");
        if (!Number.isFinite(itemId)) throw new Error("Invalid inventory id");

        const data =
          invType === "material"
            ? await getMaterial(itemId)
            : invType === "consumable"
              ? await getConsumable(itemId)
              : await getEquipment(itemId);

        if (!alive) return;
        setItem(data as Item);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load inventory item");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [invType, itemId]);

  const title = useMemo(() => {
    if (!invType) return "Inventory Item";
    if (!item) return `Inventory (${invType}) #${id}`;
    return item.name || `Inventory (${invType}) #${id}`;
  }, [invType, item, id]);

  return (
    <>
      <h3 className="mb-3">{title}</h3>

      <div className="mb-3">
        <Link to="/makerfex/inventory">← Back to Inventory</Link>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : err ? (
        <Alert variant="danger">{err}</Alert>
      ) : !item ? (
        <Alert variant="warning">Not found.</Alert>
      ) : (
        <>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <Badge bg="primary">{invType}</Badge>
                {!item.is_active ? <Badge bg="secondary">inactive</Badge> : null}
              </div>

              <div><strong>Name:</strong> {item.name || "—"}</div>
              <div><strong>SKU:</strong> {item.sku || "—"}</div>
              <div><strong>Unit:</strong> {item.unit_of_measure || "—"}</div>
              <div><strong>On hand:</strong> {item.quantity_on_hand ?? "—"}</div>
              <div><strong>Reorder point:</strong> {item.reorder_point ?? "—"}</div>

              {invType === "material" ? (
                <div><strong>Material type:</strong> {(item as any).material_type || "—"}</div>
              ) : invType === "consumable" ? (
                <div><strong>Consumable type:</strong> {(item as any).consumable_type || "—"}</div>
              ) : (
                <>
                  <div><strong>Equipment type:</strong> {(item as any).equipment_type || "—"}</div>
                  <div><strong>Serial #:</strong> {(item as any).serial_number || "—"}</div>
                </>
              )}
            </Card.Body>
          </Card>

          <InventoryLedgerTable inventoryType={invType} inventoryId={item.id} />
        </>
      )}
    </>
  );
}

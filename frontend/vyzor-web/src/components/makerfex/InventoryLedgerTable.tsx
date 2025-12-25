// src/components/makerfex/InventoryLedgerTable.tsx
// ============================================================================
// Inventory Ledger Table (Server-driven)
// ----------------------------------------------------------------------------
// - Pagination + ordering via useServerDataTable
// - Filters (basic): reason + created_after/created_before
// - Locked to a specific inventory item (inventory_type + inventory_id)
// ============================================================================
import { useMemo } from "react";
import { Card, Form, Table } from "react-bootstrap";
import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../tables/DataTableControls";
import { listInventoryTransactions, type InventoryTransaction, type InventoryType } from "../../api/inventory";

type Props = {
  inventoryType: InventoryType;
  inventoryId: number;
};

function toggleOrdering(current: string, nextField: string): string {
  const isDesc = current === `-${nextField}`;
  const isAsc = current === nextField;
  if (!isAsc && !isDesc) return nextField;
  if (isAsc) return `-${nextField}`;
  return "";
}

function sortIndicator(ordering: string, field: string): string {
  if (ordering === field) return " ▲";
  if (ordering === `-${field}`) return " ▼";
  return "";
}

function fmtDateTime(s: string) {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export default function InventoryLedgerTable({ inventoryType, inventoryId }: Props) {
  const {
    q,
    setQ,
    ordering,
    setOrdering,
    page,
    setPage,
    pageSize,
    setPageSize,
    data,
    loading,
    error,
    actions,
  } = useServerDataTable<Record<string, any>, InventoryTransaction>({
    fetcher: async (params) => {
      // Locked item scope always applies (tenant safety is server-side, too)
      const locked = { inventory_type: inventoryType, inventory_id: inventoryId };
      const merged = { ...params, ...locked };
      return listInventoryTransactions(merged).then((r) => ({
        count: r.count ?? 0,
        results: r.items ?? [],
      }));
    },
    debounceMs: 250,
    initial: {
      ordering: "-created_at",
      page: 1,
      pageSize: 25,
      extraParams: {
        reason: "",
        created_after: "",
        created_before: "",
      },
    },
  });

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

  const shownLabel = useMemo(() => {
    const shown = rows.length;
    return `${shown} shown • ${total} total`;
  }, [rows.length, total]);

  const extra = actions.extraParams ?? {};
  const reason = (extra as any).reason ?? "";
  const createdAfter = (extra as any).created_after ?? "";
  const createdBefore = (extra as any).created_before ?? "";

  return (
    <Card>
      <Card.Body>
        <h5 className="mb-3">Transaction history</h5>

        <DataTableControls
          q={q}
          onQChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          searchPlaceholder="Search notes…"
          pageSize={pageSize}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
          shownCountLabel={shownLabel}
          onClearFilters={() => {
            setQ("");
            setOrdering("-created_at");
            actions.setExtraParams({ reason: "", created_after: "", created_before: "" });
            setPage(1);
          }}
          afterSearch={
            <div className="d-flex flex-wrap gap-2 align-items-end">
              <Form.Group>
                <Form.Label className="mb-1">Reason</Form.Label>
                <Form.Select
                  size="sm"
                  value={reason}
                  onChange={(e) => {
                    actions.setExtraParams({ ...extra, reason: e.target.value });
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  <option value="consume">consume</option>
                  <option value="adjustment">adjustment</option>
                  <option value="waste">waste</option>
                  <option value="return">return</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label className="mb-1">From</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={createdAfter}
                  onChange={(e) => {
                    actions.setExtraParams({ ...extra, created_after: e.target.value });
                    setPage(1);
                  }}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="mb-1">To</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={createdBefore}
                  onChange={(e) => {
                    actions.setExtraParams({ ...extra, created_before: e.target.value });
                    setPage(1);
                  }}
                />
              </Form.Group>
            </div>
          }
        />

        <div className="mt-3">
          {error ? (
            <div className="text-danger">{String(error)}</div>
          ) : (
            <Table responsive hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th
                    role="button"
                    onClick={() => setOrdering(toggleOrdering(ordering, "created_at"))}
                  >
                    When{sortIndicator(ordering, "created_at")}
                  </th>
                  <th>Type</th>
                  <th
                    role="button"
                    onClick={() => setOrdering(toggleOrdering(ordering, "quantity_delta"))}
                  >
                    Delta{sortIndicator(ordering, "quantity_delta")}
                  </th>
                  <th
                    role="button"
                    onClick={() => setOrdering(toggleOrdering(ordering, "reason"))}
                  >
                    Reason{sortIndicator(ordering, "reason")}
                  </th>
                  <th>Project</th>
                  <th>Station</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7}>No transactions found.</td></tr>
                ) : (
                  rows.map((t) => (
                    <tr key={t.id}>
                      <td>{fmtDateTime(t.created_at)}</td>
                      <td>{t.inventory_type}</td>
                      <td>{t.quantity_delta}</td>
                      <td>{t.reason}</td>
                      <td>{t.project ?? "—"}</td>
                      <td>{t.station ?? "—"}</td>
                      <td>{t.notes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

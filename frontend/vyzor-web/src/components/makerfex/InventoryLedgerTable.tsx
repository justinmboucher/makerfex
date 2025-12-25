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
import {
  listInventoryTransactions,
  type InventoryTransaction,
  type InventoryType,
} from "../../api/inventory";

type Reason = InventoryTransaction["reason"];

type ExtraParams = {
  reason?: Reason;
  created_after?: string;  // YYYY-MM-DD
  created_before?: string; // YYYY-MM-DD
};

type Props = {
  inventoryType: InventoryType;
  inventoryId: number;
};

function toggleOrdering(current: string, field: string): string {
  const isDesc = current === `-${field}`;
  const isAsc = current === field;
  if (!isAsc && !isDesc) return field;
  if (isAsc) return `-${field}`;
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
  // ✅ Correct generic order: <RowType, ExtraParamsType>
  const { state, actions } = useServerDataTable<InventoryTransaction, ExtraParams>({
    fetcher: async (params) => {
      const res = await listInventoryTransactions({
        ...params,
        inventory_type: inventoryType,
        inventory_id: inventoryId,
      });

      // Hook expects { results, count }
      return {
        count: res.count ?? 0,
        results: res.items ?? [],
      };
    },
    debounceMs: 250,
    initial: {
      ordering: "-created_at",
      page: 1,
      pageSize: 25,
      extraParams: {
        reason: undefined,
        created_after: undefined,
        created_before: undefined,
      },
    },
  });

  const rows = state.items;          // InventoryTransaction[]
  const total = state.count;         // number
  const extra = state.extraParams ?? {};
  const reason = extra.reason;
  const createdAfter = extra.created_after ?? "";
  const createdBefore = extra.created_before ?? "";

  const shownLabel = useMemo(() => {
    return `${rows.length} shown • ${total} total`;
  }, [rows.length, total]);

  return (
    <Card>
      <Card.Body>
        <h5 className="mb-3">Transaction history</h5>

        <DataTableControls
          q={state.q}
          onQChange={(v) => actions.setQ(v)}
          searchPlaceholder="Search notes…"
          pageSize={state.pageSize}
          onPageSizeChange={(n) => actions.setPageSize(n)}
          shownCountLabel={shownLabel}
          onClearFilters={() => {
            actions.clearFilters();
            actions.setExtraParams({
              reason: undefined,
              created_after: undefined,
              created_before: undefined,
            });
          }}
          afterSearch={
            <div className="d-flex flex-wrap gap-2 align-items-end">
              <Form.Group>
                <Form.Label className="mb-1">Reason</Form.Label>
                <Form.Select
                  size="sm"
                  value={reason ?? ""}
                  onChange={(e) => {
                    const v = e.target.value as Reason | "";
                    actions.setExtraParams({ reason: v === "" ? undefined : v });
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
                    const v = e.target.value;
                    actions.setExtraParams({ created_after: v ? v : undefined });
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
                    const v = e.target.value;
                    actions.setExtraParams({ created_before: v ? v : undefined });
                  }}
                />
              </Form.Group>
            </div>
          }
        />

        <div className="mt-3">
          {state.error ? (
            <div className="text-danger">{String(state.error)}</div>
          ) : (
            <Table responsive hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th
                    role="button"
                    onClick={() =>
                      actions.setOrdering(toggleOrdering(state.ordering, "created_at"))
                    }
                  >
                    When{sortIndicator(state.ordering, "created_at")}
                  </th>
                  <th>Type</th>
                  <th
                    role="button"
                    onClick={() =>
                      actions.setOrdering(toggleOrdering(state.ordering, "quantity_delta"))
                    }
                  >
                    Delta{sortIndicator(state.ordering, "quantity_delta")}
                  </th>
                  <th
                    role="button"
                    onClick={() =>
                      actions.setOrdering(toggleOrdering(state.ordering, "reason"))
                    }
                  >
                    Reason{sortIndicator(state.ordering, "reason")}
                  </th>
                  <th>Project</th>
                  <th>Station</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {state.loading ? (
                  <tr>
                    <td colSpan={7}>Loading…</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No transactions found.</td>
                  </tr>
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

// src/pages/makerfex/Customers.tsx
// ============================================================================
// Makerfex Customers Page
// ----------------------------------------------------------------------------
// Server-driven data table:
// - ?q= search (debounced)
// - ?ordering= sorting
// - ?page= / ?page_size= pagination
// - Optional presets (backend param bundles)
// ============================================================================

import { Table, Spinner, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { listCustomers } from "../../api/customers";
import type { Customer } from "../../api/customers";
import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../../components/tables/DataTableControls";
import type { TablePreset } from "../../components/tables/tablePresets";

type CustomerExtraParams = {
  vip?: 1;
};

const CUSTOMER_PRESETS: TablePreset<CustomerExtraParams>[] = [
  { key: "all", label: "All customers", params: {}, is_builtin: true },
  { key: "vip", label: "VIP only", params: { vip: 1 }, is_builtin: true },
  // you can add "recent" later if you support ordering presets on the backend contract
];

function toggleOrdering(current: string, nextField: string): string {
  const isDesc = current === `-${nextField}`;
  const isAsc = current === nextField;

  if (!isAsc && !isDesc) return nextField; // none -> asc
  if (isAsc) return `-${nextField}`; // asc -> desc
  return ""; // desc -> none
}

function sortIndicator(ordering: string, field: string): string {
  if (ordering === field) return " ▲";
  if (ordering === `-${field}`) return " ▼";
  return "";
}

export default function Customers() {
  const table = useServerDataTable<Customer, CustomerExtraParams>({
    presets: CUSTOMER_PRESETS,
    defaultPresetKey: "all",
    debounceMs: 250,
    fetcher: async (params) => {
      const data = await listCustomers(params as any);
      return { count: data.count, results: data.results };
    },
  });

  const { state, actions } = table;
  const shownLabel = state.loading ? "Loading…" : `${state.items.length} shown • ${state.count} total`;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h4 className="mb-0">Makerfex Customers</h4>
      </div>

      <DataTableControls<CustomerExtraParams>
        q={state.q}
        onQChange={(v) => actions.setQ(v)}
        pageSize={state.pageSize}
        onPageSizeChange={(n) => actions.setPageSize(n)}
        shownCountLabel={shownLabel}
        presets={CUSTOMER_PRESETS}
        activePresetKey={state.activePresetKey}
        onPresetChange={(key) => actions.applyPreset(key)}
        onClearFilters={() => actions.clearFilters()}
        onSavePreset={(label) => {
          // temporary wiring: you can persist to localStorage next
          console.log("Save preset:", label);
        }}
      />

      {state.loading ? (
        <div className="py-4 d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading…</span>
        </div>
      ) : state.error ? (
        <div className="py-3 text-danger">{state.error}</div>
      ) : (
        <>
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th
                  role="button"
                  onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "last_name"))}
                >
                  Name{sortIndicator(state.ordering, "last_name")}
                </th>

                <th role="button" onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "email"))}>
                  Email{sortIndicator(state.ordering, "email")}
                </th>

                <th role="button" onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "phone"))}>
                  Phone{sortIndicator(state.ordering, "phone")}
                </th>

                <th
                  role="button"
                  onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "is_vip"))}
                >
                  VIP{sortIndicator(state.ordering, "is_vip")}
                </th>
              </tr>
            </thead>

            <tbody>
              {state.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted py-4">
                    No customers found.
                  </td>
                </tr>
              ) : (
                state.items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/customers/${c.id}`}>{c.name || "—"}</Link>
                    </td>
                    <td>{c.email || "—"}</td>
                    <td>{c.phone || "—"}</td>
                    <td>
                      {c.is_vip ? (
                        <Badge bg="warning" text="dark">
                          VIP
                        </Badge>
                      ) : (
                        <Badge bg="secondary">Standard</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="d-flex align-items-center justify-content-between mt-3">
            <div className="text-muted">
              Page {state.page} of {state.pageCount}
            </div>

            <div className="d-flex gap-2">
              <Button variant="outline-secondary" disabled={state.page <= 1} onClick={() => actions.goToPage(state.page - 1)}>
                ← Prev
              </Button>
              <Button
                variant="outline-secondary"
                disabled={state.page >= state.pageCount}
                onClick={() => actions.goToPage(state.page + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// src/components/makerfex/SalesOrdersTable.tsx
import { useMemo, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../tables/DataTableControls";
import {
  addSavedPreset,
  deleteSavedPreset,
  loadSavedPresets,
  type TablePreset,
} from "../tables/tablePresets";
import { listSalesOrders, type SalesOrder } from "../../api/sales";

type SalesExtraParams = {
  status?: "draft" | "open" | "paid" | "cancelled" | "refunded";
  source?: "etsy" | "website" | "pos" | "other";
};

const DEFAULT_STORAGE_KEY = "makerfex.tablepresets.sales";

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All", params: {}, is_builtin: true },
  { key: "open", label: "Open", params: { status: "open" }, is_builtin: true },
  { key: "paid", label: "Paid", params: { status: "paid" }, is_builtin: true },
  { key: "cancelled", label: "Cancelled", params: { status: "cancelled" }, is_builtin: true },
];

function toggleOrdering(current: string, field: string): string {
  const asc = current === field;
  const desc = current === `-${field}`;
  if (!asc && !desc) return field;
  if (asc) return `-${field}`;
  return "";
}

function sortIndicator(ordering: string, field: string) {
  if (ordering === field) return " ▲";
  if (ordering === `-${field}`) return " ▼";
  return "";
}

export default function SalesOrdersTable({
  title = "Sales",
  presetStorageKey = DEFAULT_STORAGE_KEY,
}: {
  title?: string;
  presetStorageKey?: string;
}) {
  const [savedPresets, setSavedPresets] = useState(() => loadSavedPresets(presetStorageKey));
  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  const table = useServerDataTable<SalesOrder, SalesExtraParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    initial: { pageSize: 25 },
    fetcher: async (params) => {
      const res = await listSalesOrders(params as any);
      return { count: res.count ?? 0, results: res.items ?? [] };
    },
  });

  const { state, actions } = table;

  const shownLabel = state.loading ? "Loading…" : `${state.items.length} shown • ${state.count} total`;

  const currentPresetParams = (presets.find((p) => p.key === state.activePresetKey)?.params ??
    {}) as SalesExtraParams;

  const saveParams = useMemo(() => {
    const out: any = { ...(currentPresetParams as any), ...(state.extraParams as any) };
    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;
    delete out.page;
    delete out.page_size;

    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === undefined || v === null || v === "") delete out[k];
    });
    return out;
  }, [currentPresetParams, state.extraParams, state.q, state.ordering]);

  function handleSavePreset(label: string) {
    const key =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ?? `preset_${Date.now()}`;
    const { next, error } = addSavedPreset(presetStorageKey, savedPresets, { key, label, params: saveParams });
    if (error) return alert(error);
    setSavedPresets(next);
    actions.applyPreset(key);
  }

  function handleDeletePreset(key: string) {
    const yes = window.confirm("Delete this saved preset?");
    if (!yes) return;
    const next = deleteSavedPreset(presetStorageKey, savedPresets, key);
    setSavedPresets(next);
    if (state.activePresetKey === key) actions.applyPreset("all");
  }

  const canDeletePreset = (key: string) => !BUILTIN_PRESETS.some((p) => p.key === key);

  return (
    <>
      <h4 className="mb-3">{title}</h4>

      <DataTableControls
        q={state.q}
        onQChange={(v) => actions.setQ(v)}
        searchPlaceholder="Search sales…"
        pageSize={state.pageSize}
        onPageSizeChange={(n) => actions.setPageSize(n)}
        shownCountLabel={shownLabel}
        presets={presets}
        activePresetKey={state.activePresetKey}
        onPresetChange={(key) => actions.applyPreset(key)}
        onClearFilters={() => actions.clearFilters()}
        onSavePreset={(label) => handleSavePreset(label)}
        onDeletePreset={(key) => handleDeletePreset(key)}
        canDeletePreset={canDeletePreset}
        savePresetTitle="Save Sales preset"
        savePresetLabel="Preset name"
      />

      {state.error ? (
        <div className="text-danger">{state.error}</div>
      ) : (
        <Table responsive hover size="sm" className="mb-0">
          <thead>
            <tr>
              <th role="button" onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "order_date"))}>
                Date{sortIndicator(state.ordering, "order_date")}
              </th>
              <th>Order #</th>
              <th>Status</th>
              <th>Source</th>
              <th>Project</th>
              <th className="text-end">Total</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {state.loading ? (
              <tr><td colSpan={7}>Loading…</td></tr>
            ) : state.items.length === 0 ? (
              <tr><td colSpan={7}>No sales found.</td></tr>
            ) : (
              state.items.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_date ? new Date(o.order_date).toLocaleDateString() : "—"}</td>
                  <td>{o.order_number || `#${o.id}`}</td>
                  <td>{o.status}</td>
                  <td>{o.source}</td>
                  <td>{o.project ? `#${o.project}` : "—"}</td>
                  <td className="text-end">{o.total_amount ?? "—"}</td>
                  <td className="text-end">
                    <Button as={Link as any} to={`/sales/${o.id}`} size="sm" variant="primary">
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Simple pager */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={state.page <= 1 || state.loading}
          onClick={() => actions.goToPage(state.page - 1)}
        >
          Prev
        </Button>
        <div className="align-self-center">
          Page {state.page} / {state.pageCount}
        </div>
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={state.page >= state.pageCount || state.loading}
          onClick={() => actions.goToPage(state.page + 1)}
        >
          Next
        </Button>
      </div>
    </>
  );
}

// src/components/makerfex/InventoryTable.tsx
// ============================================================================
// Reusable InventoryTable (Read-only)
// ----------------------------------------------------------------------------
// Purpose:
// - Canonical server-driven table pattern for inventory everywhere.
// - Supports presets (saved + built-in), debounced search, sorting, pagination.
// - Supports optional locked params (future-proof) so detail pages can embed a
//   scoped inventory table without duplicating logic.
//
// Notes:
// - Non-destructive.
// - Backend is authoritative for filtering/pagination.
// ============================================================================

import { useMemo, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";

import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../tables/DataTableControls";
import {
  addSavedPreset,
  deleteSavedPreset,
  loadSavedPresets,
  type TablePreset,
} from "../tables/tablePresets";

import {
  listMaterials,
  listConsumables,
  listEquipment,
  type Material,
  type Consumable,
  type Equipment,
} from "../../api/inventory";

type InventoryKind = "materials" | "consumables" | "equipment";
type InventoryRow = Material | Consumable | Equipment;

type InventoryPresetParams = {
  // contract + inventory filters
  low_stock?: "1" | "0";
  is_active?: "1" | "0";
  preferred_station?: string | number;

  // canonical
  q?: string;
  ordering?: string;
};

const DEFAULT_PRESET_STORAGE_KEY_BASE = "makerfex.inventory.tablePresets";

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All inventory", params: {}, is_builtin: true },
  { key: "low_stock", label: "Low stock", params: { low_stock: "1" }, is_builtin: true },
  { key: "inactive", label: "Inactive", params: { is_active: "0" }, is_builtin: true },
];

function storageKeyFor(kind: InventoryKind, override?: string) {
  if (override) return override;
  return `${DEFAULT_PRESET_STORAGE_KEY_BASE}.${kind}`;
}

function cleanMerge(...objs: Array<Record<string, any> | undefined | null>) {
  const out: Record<string, any> = {};
  for (const o of objs) {
    if (!o) continue;
    Object.assign(out, o);
  }
  Object.keys(out).forEach((k) => {
    const v = out[k];
    if (v === undefined || v === null || v === "") delete out[k];
  });
  return out;
}

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

function kindLabel(kind: InventoryKind) {
  if (kind === "materials") return "Materials";
  if (kind === "consumables") return "Consumables";
  return "Equipment";
}

function kindFieldLabel(kind: InventoryKind) {
  if (kind === "materials") return "Material type";
  if (kind === "consumables") return "Consumable type";
  return "Serial #";
}

function kindFieldValue(kind: InventoryKind, row: InventoryRow): string {
  if (kind === "materials") return (row as Material).material_type || "—";
  if (kind === "consumables") return (row as Consumable).consumable_type || "—";
  return (row as Equipment).serial_number || "—";
}

function toNum(v: any): number {
  if (v === undefined || v === null || v === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function stockState(row: InventoryRow) {
  const qty = toNum(row.quantity_on_hand);
  const reorder = toNum(row.reorder_point);

  const outOfStock = Number.isFinite(qty) && qty <= 0;
  const lowStock =
    !outOfStock &&
    Number.isFinite(qty) &&
    Number.isFinite(reorder) &&
    reorder > 0 &&
    qty <= reorder;

  return { qty, reorder, outOfStock, lowStock };
}

function pillClass(base: "success" | "warning" | "danger" | "primary" | "secondary") {
  // Vyzor “transparent badge” style
  return `bg-${base}-transparent text-${base}`;
}


export type InventoryTableProps = {
  kind: InventoryKind;
  title?: string;

  // Locked params always apply and override presets/filters (future-proof).
  // Example: embed inventory scoped to a station later, etc.
  lockedParams?: Partial<InventoryPresetParams>;

  // Override preset storage key if you want separate saved preset pools per context.
  presetStorageKey?: string;
};

export default function InventoryTable({
  kind,
  title,
  lockedParams,
  presetStorageKey,
}: InventoryTableProps) {
  const storageKey = storageKeyFor(kind, presetStorageKey);

  const [savedPresets, setSavedPresets] = useState(() => loadSavedPresets(storageKey));
  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  const table = useServerDataTable<InventoryRow, InventoryPresetParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    fetcher: async (params) => {
      // Locked params always win
      const merged = cleanMerge(params as any, lockedParams as any);

      const data =
        kind === "materials"
          ? await listMaterials(merged as any)
          : kind === "consumables"
            ? await listConsumables(merged as any)
            : await listEquipment(merged as any);

      return { count: data.count ?? 0, results: data.items ?? [] };
    },
    initial: { pageSize: 25 },
  });

  const { state, actions } = table;

  const shownLabel = state.loading
    ? "Loading…"
    : `${state.items.length} shown • ${state.count} total`;

  const currentPresetParams = (presets.find((p) => p.key === state.activePresetKey)?.params ??
    {}) as InventoryPresetParams;

  // Save presets should capture:
  // - current preset params
  // - extraParams (if we add page-specific filters later)
  // - locked params (scope), so saving from an embedded context stays scoped
  const saveParams = useMemo(() => {
    const out: InventoryPresetParams = {
      ...(currentPresetParams as any),
      ...(state.extraParams as any),
      ...(lockedParams as any),
    };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    delete (out as any).page;
    delete (out as any).page_size;

    Object.keys(out).forEach((k) => {
      const v = (out as any)[k];
      if (v === undefined || v === null || v === "") delete (out as any)[k];
    });

    return out;
  }, [currentPresetParams, state.extraParams, state.q, state.ordering, lockedParams]);

  function handleSavePreset(label: string) {
    const key =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ?? `preset_${Date.now()}`;

    const { next, error } = addSavedPreset(storageKey, savedPresets, {
      key,
      label,
      params: saveParams,
    });

    if (error) {
      alert(error);
      return;
    }

    setSavedPresets(next);
    actions.applyPreset(key);
  }

  function handleDeletePreset(key: string) {
    const yes = window.confirm("Delete this saved preset?");
    if (!yes) return;

    const next = deleteSavedPreset(storageKey, savedPresets, key);
    setSavedPresets(next);

    if (state.activePresetKey === key) actions.applyPreset("all");
  }

  const canDeletePreset = (key: string) => !BUILTIN_PRESETS.some((p) => p.key === key);

  return (
    <>
      {title ? <h5 className="mb-3">{title}</h5> : null}

      <DataTableControls
        q={state.q}
        onQChange={(v) => actions.setQ(v)}
        searchPlaceholder={`Search ${kindLabel(kind).toLowerCase()}…`}
        pageSize={state.pageSize}
        onPageSizeChange={(n) => actions.setPageSize(n)}
        shownCountLabel={shownLabel}
        presets={presets}
        activePresetKey={state.activePresetKey}
        onPresetChange={(key) => actions.applyPreset(key)}
        onClearFilters={() => {
          actions.clearFilters();
        }}
        onSavePreset={(label) => handleSavePreset(label)}
        onDeletePreset={(key) => handleDeletePreset(key)}
        canDeletePreset={canDeletePreset}
        savePresetTitle={`Save ${kindLabel(kind)} preset`}
        savePresetLabel="Preset name"
      />

      {state.error ? (
        <div className="alert alert-danger mt-3 mb-0">{state.error}</div>
      ) : (
        <Card className="mt-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover striped className="mb-0">
                <thead>
                  <tr>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "name"))}
                    >
                      Item{sortIndicator(state.ordering, "name")}
                    </th>

                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "quantity_on_hand"))}
                    >
                      Qty{sortIndicator(state.ordering, "quantity_on_hand")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(
                          toggleOrdering(state.ordering, "reorder_point")
                        )
                      }
                    >
                      Reorder{sortIndicator(state.ordering, "reorder_point")}
                    </th>
                    <th>Unit</th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "unit_cost"))
                      }
                    >
                      Unit cost{sortIndicator(state.ordering, "unit_cost")}
                    </th>
                    <th>{kindFieldLabel(kind)}</th>
                  </tr>
                </thead>

                <tbody>
                  {state.loading ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center">
                        Loading…
                      </td>
                    </tr>
                  ) : state.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center">
                        No inventory items found.
                      </td>
                    </tr>
                  ) : (
                    state.items.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded bg-light flex-shrink-0"
                              style={{
                                width: 34,
                                height: 34,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {row.image_url ? (
                                <img
                                  src={row.image_url}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <div style={{ width: "100%", height: "100%" }} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="fw-semibold text-truncate">
                                {row.name || `Item #${row.id}`}
                              </div>

                              <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
                                <span>SKU: {row.sku || "—"}</span>

                                {/* Kind/type pill */}
                                <span className={`badge ${pillClass("secondary")}`}>
                                  {kind === "equipment" ? "Equipment" : kindFieldValue(kind, row)}
                                </span>

                                {/* Stock state pill (display-only) */}
                                {(() => {
                                  const s = stockState(row);
                                  if (s.outOfStock) {
                                    return <span className={`badge ${pillClass("danger")}`}>Out of stock</span>;
                                  }
                                  if (s.lowStock) {
                                    return <span className={`badge ${pillClass("warning")}`}>Low stock</span>;
                                  }
                                  return null;
                                })()}

                                {/* Active pill */}
                                <span className={`badge ${row.is_active ? pillClass("success") : pillClass("danger")}`}>
                                  {row.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{row.quantity_on_hand ?? "—"}</td>
                        <td>{row.reorder_point ?? "—"}</td>
                        <td>{row.unit_of_measure || "—"}</td>
                        <td>{row.unit_cost ?? "—"}</td>
                        <td>{kindFieldValue(kind, row)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <div className="d-flex align-items-center justify-content-between p-3">
              <div className="text-muted small">
                Page {state.page} of {state.pageCount}
              </div>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={state.page <= 1}
                  onClick={() => actions.goToPage(state.page - 1)}
                >
                  ← Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={state.page >= state.pageCount}
                  onClick={() => actions.goToPage(state.page + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

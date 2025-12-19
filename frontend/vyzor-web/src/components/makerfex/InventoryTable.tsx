// src/components/makerfex/InventoryTable.tsx
// ============================================================================
// Reusable InventoryTable (Read-only)
// ----------------------------------------------------------------------------
// - Server-driven: debounced q, ordering, pagination, presets
// - Option B extraParams supported by useServerDataTable (not heavily used yet)
// - Tabs/page decide "kind" (materials/consumables/equipment)
// ============================================================================

import { useMemo, useState } from "react";
import { Card, Table, Pagination, Spinner, Alert } from "react-bootstrap";

import DataTableControls from "../tables/DataTableControls";
import type { TablePreset } from "../tables/tablePresets";
import {
  addSavedPreset,
  deleteSavedPreset,
  loadSavedPresets,
} from "../tables/tablePresets";

import { useServerDataTable } from "../../hooks/useServerDataTable";
import {
  listMaterials,
  listConsumables,
  listEquipment,
  type Material,
  type Consumable,
  type Equipment,
} from "../../api/inventory";

type Kind = "materials" | "consumables" | "equipment";
type Row = Material | Consumable | Equipment;

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All", params: {}, is_builtin: true },
  { key: "low_stock", label: "Low stock", params: { low_stock: "1" }, is_builtin: true },
  { key: "inactive", label: "Inactive", params: { is_active: "0" }, is_builtin: true },
];

function storageKeyFor(kind: Kind) {
  return `makerfex.tablepresets.inventory.${kind}`;
}

function kindLabel(kind: Kind) {
  if (kind === "materials") return "Materials";
  if (kind === "consumables") return "Consumables";
  return "Equipment";
}

function isMaterial(x: Row): x is Material {
  return (x as any).material_type !== undefined;
}
function isConsumable(x: Row): x is Consumable {
  return (x as any).consumable_type !== undefined;
}
function isEquipment(x: Row): x is Equipment {
  return (x as any).serial_number !== undefined;
}

export default function InventoryTable({ kind }: { kind: Kind }) {
  const storageKey = storageKeyFor(kind);

  const [savedPresets, setSavedPresets] = useState<TablePreset[]>(() => loadSavedPresets(storageKey));
  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  const fetcher = useMemo(() => {
    return async (params: Record<string, any>) => {
      if (kind === "materials") {
        const res = await listMaterials(params);
        return { count: res.count ?? res.items.length, results: res.items };
      }
      if (kind === "consumables") {
        const res = await listConsumables(params);
        return { count: res.count ?? res.items.length, results: res.items };
      }
      const res = await listEquipment(params);
      return { count: res.count ?? res.items.length, results: res.items };
    };
  }, [kind]);

  const table = useServerDataTable<Row, Record<string, any>>({
    fetcher,
    debounceMs: 250,
    presets,
    defaultPresetKey: "all",
    initial: { pageSize: 25 },
  });

  const { state, actions } = table;
  const shownLabel = `${state.items.length} shown • ${state.count} total`;

  function toggleOrdering(field: string) {
    // Same UX pattern as canonical tables:
    // - click once: asc
    // - click again: desc
    // - click again: clear
    const cur = state.ordering || "";
    if (cur === field) actions.setOrdering(`-${field}`);
    else if (cur === `-${field}`) actions.clearSorting();
    else actions.setOrdering(field);
  }

  function orderIcon(field: string) {
    if (state.ordering === field) return " ▲";
    if (state.ordering === `-${field}`) return " ▼";
    return "";
  }

  function onSavePreset(label: string) {
    const key = `saved_${Date.now()}`;
    const params = {
      // include canonical state + extraParams so it round-trips correctly
      ...(state.extraParams ?? {}),
      q: state.q || undefined,
      ordering: state.ordering || undefined,
      // include active preset params? (No: presets are the bundle already chosen.
      // Saved presets should reflect the current *effective* params.)
      // We’ll store low_stock/is_active etc by reading from merged state:
      // easiest: rely on the current active preset key + extraParams.
      // For now, store only explicit state + extraParams; users can save after applying preset.
    };

    const { next, error } = addSavedPreset(storageKey, savedPresets, { key, label, params });
    if (!error) setSavedPresets(next);
  }

  function onDeletePreset(key: string) {
    const next = deleteSavedPreset(storageKey, savedPresets, key);
    setSavedPresets(next);
    if (state.activePresetKey === key) actions.applyPreset("all");
  }

  // Pagination (simple, predictable)
  const page = state.page;
  const pageCount = state.pageCount;

  const pagination = (
    <Pagination className="mb-0">
      <Pagination.Prev disabled={page <= 1} onClick={() => actions.goToPage(page - 1)} />
      <Pagination.Item active>{page}</Pagination.Item>
      <Pagination.Next disabled={page >= pageCount} onClick={() => actions.goToPage(page + 1)} />
    </Pagination>
  );

  return (
    <Card>
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="fw-semibold">{kindLabel(kind)}</div>
        <div>{pagination}</div>
      </Card.Header>

      <Card.Body>
        <DataTableControls
          q={state.q}
          onQChange={actions.setQ}
          searchPlaceholder={`Search ${kindLabel(kind).toLowerCase()}…`}
          pageSize={state.pageSize}
          onPageSizeChange={actions.setPageSize}
          shownCountLabel={shownLabel}
          presets={presets}
          activePresetKey={state.activePresetKey}
          onPresetChange={actions.applyPreset}
          onClearFilters={actions.clearFilters}
          onSavePreset={onSavePreset}
          onDeletePreset={onDeletePreset}
          canDeletePreset={(k) => k.startsWith("saved_")}
        />

        {state.error ? <Alert variant="danger">{state.error}</Alert> : null}

        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }} onClick={() => toggleOrdering("name")}>
                  Name{orderIcon("name")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleOrdering("sku")}>
                  SKU{orderIcon("sku")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleOrdering("quantity_on_hand")}>
                  Qty{orderIcon("quantity_on_hand")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleOrdering("reorder_point")}>
                  Reorder Pt{orderIcon("reorder_point")}
                </th>
                <th>Unit</th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleOrdering("unit_cost")}>
                  Unit Cost{orderIcon("unit_cost")}
                </th>
                <th>
                  {kind === "materials" ? "Material Type" : kind === "consumables" ? "Consumable Type" : "Serial #"}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleOrdering("is_active")}>
                  Active{orderIcon("is_active")}
                </th>
              </tr>
            </thead>

            <tbody>
              {state.loading ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center">
                    <Spinner animation="border" size="sm" /> Loading…
                  </td>
                </tr>
              ) : state.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center">
                    No items
                  </td>
                </tr>
              ) : (
                state.items.map((row) => (
                  <tr key={row.id}>
                    <td className="fw-semibold">{row.name}</td>
                    <td>{row.sku || "—"}</td>
                    <td>{row.quantity_on_hand}</td>
                    <td>{row.reorder_point}</td>
                    <td>{row.unit_of_measure || "—"}</td>
                    <td>{row.unit_cost ?? "—"}</td>
                    <td>
                      {isMaterial(row) ? row.material_type || "—" : null}
                      {isConsumable(row) ? row.consumable_type || "—" : null}
                      {isEquipment(row) ? row.serial_number || "—" : null}
                    </td>
                    <td>{row.is_active ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex align-items-center justify-content-between mt-3">
          <div className="text-muted small">Page {page} of {pageCount}</div>
          <div>{pagination}</div>
        </div>
      </Card.Body>
    </Card>
  );
}

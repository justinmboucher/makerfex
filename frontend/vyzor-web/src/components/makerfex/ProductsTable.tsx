// src/components/makerfex/ProductsTable.tsx
// ============================================================================
// ProductsTable (Product Templates)
// ----------------------------------------------------------------------------
// - Server-driven
// - Read-only
// - Template-first mental model
// ============================================================================

import { useMemo, useState } from "react";
import { Card, Table } from "react-bootstrap";

import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../tables/DataTableControls";
import {
  addSavedPreset,
  deleteSavedPreset,
  loadSavedPresets,
  type TablePreset,
} from "../tables/tablePresets";

import { listProductTemplates, type ProductTemplate } from "../../api/products";

type ProductPresetParams = {
  q?: string;
  ordering?: string;
  is_active?: "1" | "0";
  default_workflow?: number | string;
};

const STORAGE_KEY = "makerfex.products.tablePresets";

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All templates", params: {}, is_builtin: true },
  {
    key: "active",
    label: "Active",
    params: { is_active: "1" },
    is_builtin: true,
  },
  {
    key: "inactive",
    label: "Inactive",
    params: { is_active: "0" },
    is_builtin: true,
  },
];

export default function ProductsTable() {
  const [savedPresets, setSavedPresets] = useState(() =>
    loadSavedPresets(STORAGE_KEY)
  );
  const presets = useMemo(
    () => [...savedPresets, ...BUILTIN_PRESETS],
    [savedPresets]
  );

  const table = useServerDataTable<ProductTemplate, ProductPresetParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    fetcher: async (params) => {
      const data = await listProductTemplates(params as any);
      return { count: data.count ?? 0, results: data.items ?? [] };
    },
    initial: { pageSize: 25 },
  });

  const { state, actions } = table;

  function handleSavePreset(label: string) {
    const key = crypto.randomUUID();
    const { next, error } = addSavedPreset(STORAGE_KEY, savedPresets, {
      key,
      label,
      params: {
        ...(state.extraParams as any),
        q: state.q || undefined,
        ordering: state.ordering || undefined,
      },
    });

    if (error) return alert(error);
    setSavedPresets(next);
    actions.applyPreset(key);
  }

  function handleDeletePreset(key: string) {
    if (!confirm("Delete this preset?")) return;
    const next = deleteSavedPreset(STORAGE_KEY, savedPresets, key);
    setSavedPresets(next);
    if (state.activePresetKey === key) actions.applyPreset("all");
  }

  return (
    <>
      <DataTableControls
        q={state.q}
        onQChange={actions.setQ}
        searchPlaceholder="Search product templates…"
        pageSize={state.pageSize}
        onPageSizeChange={actions.setPageSize}
        shownCountLabel={
          state.loading
            ? "Loading…"
            : `${state.items.length} shown • ${state.count} total`
        }
        presets={presets}
        activePresetKey={state.activePresetKey}
        onPresetChange={actions.applyPreset}
        onClearFilters={actions.clearFilters}
        onSavePreset={handleSavePreset}
        onDeletePreset={handleDeletePreset}
        canDeletePreset={(k) => !BUILTIN_PRESETS.some((p) => p.key === k)}
        savePresetTitle="Save product preset"
        savePresetLabel="Preset name"
      />

      <Card className="mt-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Base price</th>
                  <th>Est. hours</th>
                  <th>Workflow</th>
                  <th>Status</th>
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
                      No product templates found.
                    </td>
                  </tr>
                ) : (
                  state.items.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.name}</td>
                      <td className="text-muted">{p.slug}</td>
                      <td>{p.base_price ?? "—"}</td>
                      <td>{p.estimated_hours ?? "—"}</td>
                      <td>{p.default_workflow_name ?? "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.is_active
                              ? "bg-success-transparent text-success"
                              : "bg-danger-transparent text-danger"
                          }`}
                        >
                          {p.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

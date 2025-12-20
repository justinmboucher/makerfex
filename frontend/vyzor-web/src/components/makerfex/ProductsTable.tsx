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

function pillClass(base: "success" | "warning" | "danger" | "primary" | "secondary" | "info") {
  return `bg-${base}-transparent text-${base}`;
}

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
                  <th>Template</th>
                  <th className="text-end">Base price</th>
                  <th className="text-end">Est. hours</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {state.loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center">
                      Loading…
                    </td>
                  </tr>
                ) : state.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center">
                      No product templates found.
                    </td>
                  </tr>
                ) : (
                  state.items.map((p) => {
                    const photoSrc = p.photo_url || null;

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {/* Photo */}
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
                              {photoSrc ? (
                                <img
                                  src={photoSrc}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <div style={{ width: "100%", height: "100%" }} />
                              )}
                            </div>

                            {/* Text + pills */}
                            <div className="min-w-0">
                              <div className="fw-semibold text-truncate">{p.name || `Template #${p.id}`}</div>

                              <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
                                {/* Slug pill */}
                                {p.slug ? (
                                  <span className={`badge ${pillClass("secondary")}`}>{p.slug}</span>
                                ) : null}

                                {/* Workflow pill */}
                                {p.default_workflow_name ? (
                                  <span className={`badge ${pillClass("info")}`}>{p.default_workflow_name}</span>
                                ) : (
                                  <span className={`badge ${pillClass("warning")}`}>No workflow</span>
                                )}

                                {/* Active pill */}
                                <span
                                  className={`badge ${
                                    p.is_active ? pillClass("success") : pillClass("danger")
                                  }`}
                                >
                                  {p.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="text-end">{p.base_price ?? "—"}</td>
                        <td className="text-end">{p.estimated_hours ?? "—"}</td>
                        <td className="text-muted">
                          {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

            </Table>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

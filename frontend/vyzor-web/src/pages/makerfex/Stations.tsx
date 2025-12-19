// src/pages/makerfex/Stations.tsx
// ============================================================================
// Makerfex Stations Page
// ----------------------------------------------------------------------------
// Server-driven data table contract:
// - ?q= search (debounced)
// - ?ordering= sorting
// - ?page= / ?page_size= pagination
// - optional presets (backend param bundles)
// ============================================================================

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Table } from "react-bootstrap";

import { listStations, type Station } from "../../api/stations";
import DataTableControls from "../../components/tables/DataTableControls";
import { useServerDataTable } from "../../hooks/useServerDataTable";
import {
  addSavedPreset,
  loadSavedPresets,
  deleteSavedPreset,
  type TablePreset,
} from "../../components/tables/tablePresets";

type StationExtraParams = {
  is_active?: "true" | "false";
  // you can add shop-scoped backend filters later if needed
};

type StationPresetParams = StationExtraParams & {
  q?: string;
  ordering?: string;
};

const PRESET_STORAGE_KEY = "makerfex.stations.tablePresets";

const BUILTIN_PRESETS: TablePreset<StationPresetParams>[] = [
  { key: "all", label: "All stations", params: {}, is_builtin: true },
  { key: "active", label: "Active only", params: { is_active: "true" }, is_builtin: true },
  { key: "inactive", label: "Inactive only", params: { is_active: "false" }, is_builtin: true },
];

function toggleOrdering(current: string, field: string): string {
  const isDesc = current === `-${field}`;
  const isAsc = current === field;
  if (!isAsc && !isDesc) return field; // none -> asc
  if (isAsc) return `-${field}`; // asc -> desc
  return ""; // desc -> none
}

function sortIndicator(ordering: string, field: string): string {
  if (ordering === field) return " ▲";
  if (ordering === `-${field}`) return " ▼";
  return "";
}

export default function Stations() {
  const [savedPresets, setSavedPresets] = useState<TablePreset<StationPresetParams>[]>(() =>
    loadSavedPresets<StationPresetParams>(PRESET_STORAGE_KEY)
  );

  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  const table = useServerDataTable<Station, StationPresetParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    fetcher: async (params) => {
      const data = await listStations(params as any);
      return { count: data.count ?? 0, results: data.items ?? [] };
    },
  });

  const { state, actions } = table;

  const shownLabel = state.loading ? "Loading…" : `${state.items.length} shown • ${state.count} total`;

  // what we save into presets = current preset params + current q/ordering (no paging)
  const currentPresetParams = presets.find((p) => p.key === state.activePresetKey)?.params ?? {};

  const saveParams = useMemo(() => {
    const out: StationPresetParams = { ...(currentPresetParams as StationPresetParams) };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    // never save paging
    delete (out as any).page;
    delete (out as any).page_size;

    return out;
  }, [currentPresetParams, state.q, state.ordering]);

  function handleSavePreset(label: string) {
    const key =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ??
      `preset_${Date.now()}`;

    const { next, error } = addSavedPreset<StationPresetParams>(PRESET_STORAGE_KEY, savedPresets, {
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

    const next = deleteSavedPreset<StationPresetParams>(PRESET_STORAGE_KEY, savedPresets, key);
    setSavedPresets(next);

    if (state.activePresetKey === key) actions.applyPreset("all");
  }

  return (
    <>
      <h3 className="mb-3">Stations</h3>

      <Card className="p-3">
        <DataTableControls<StationPresetParams>
          q={state.q}
          onQChange={(v) => actions.setQ(v)}
          searchPlaceholder="Search stations…"
          pageSize={state.pageSize}
          onPageSizeChange={(n) => actions.setPageSize(n)}
          shownCountLabel={shownLabel}
          presets={presets}
          activePresetKey={state.activePresetKey}
          onPresetChange={(key) => actions.applyPreset(key)}
          onClearFilters={() => actions.clearFilters()}
          onSavePreset={(label) => handleSavePreset(label)}
          onDeletePreset={(key) => handleDeletePreset(key)}
          canDeletePreset={(key) => !BUILTIN_PRESETS.some((p) => p.key === key)}
        />

        {state.error ? (
          <div className="text-danger py-2">{state.error}</div>
        ) : (
          <>
            <Table responsive hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th
                    role="button"
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "name"))}
                  >
                    Name{sortIndicator(state.ordering, "name")}
                  </th>

                  <th
                    role="button"
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "code"))}
                  >
                    Code{sortIndicator(state.ordering, "code")}
                  </th>

                  <th
                    role="button"
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "employee_count"))}
                    title="Backend must support ordering by employee_count (optional)"
                  >
                    Members{sortIndicator(state.ordering, "employee_count")}
                  </th>

                  <th
                    role="button"
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "is_active"))}
                  >
                    Status{sortIndicator(state.ordering, "is_active")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {state.loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-muted">
                      Loading…
                    </td>
                  </tr>
                ) : state.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-muted">
                      No stations found.
                    </td>
                  </tr>
                ) : (
                  state.items.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link to={`/stations/${s.id}`}>{s.name || `Station #${s.id}`}</Link>
                      </td>
                      <td>{s.code || "—"}</td>
                      <td>{s.employee_count ?? (s.employees?.length ?? 0)}</td>
                      <td>
                        {s.is_active ? (
                          <Badge bg="success">Active</Badge>
                        ) : (
                          <Badge bg="secondary">Inactive</Badge>
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
                <Button
                  variant="outline-secondary"
                  disabled={state.page <= 1}
                  onClick={() => actions.goToPage(state.page - 1)}
                >
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
      </Card>
    </>
  );
}

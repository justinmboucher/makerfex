// src/pages/makerfex/Stations.tsx
// ============================================================================
// Makerfex Stations Page
// ----------------------------------------------------------------------------
// Server-driven data table contract:
// - ?q= search (debounced)
// - ?ordering= sorting
// - ?page= / ?page_size= pagination
// - Presets (Saved + Built-in) are param bundles (backend authoritative)
// ============================================================================

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Table } from "react-bootstrap";

import { listStations, type Station } from "../../api/stations";
import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../../components/tables/DataTableControls";
import {
  addSavedPreset,
  loadSavedPresets,
  deleteSavedPreset,
  type TablePreset,
} from "../../components/tables/tablePresets";

type StationExtraParams = {
  is_active?: "1" | "0";
};

const PRESET_STORAGE_KEY = "makerfex.stations.tablePresets";

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All stations", params: {}, is_builtin: true },
  { key: "active", label: "Active only", params: { is_active: "1" }, is_builtin: true },
  { key: "inactive", label: "Inactive only", params: { is_active: "0" }, is_builtin: true },
];

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

export default function Stations() {
  const [savedPresets, setSavedPresets] = useState<TablePreset[]>(() =>
    loadSavedPresets(PRESET_STORAGE_KEY)
  );

  // Saved (top) then Built-in (below)
  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  const table = useServerDataTable({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    fetcher: async (params) => {
      const data = await listStations(params as any);
      return { count: data.count ?? 0, results: data.items ?? [] };
    },
  });

  const { state, actions } = table;

  const shownLabel = state.loading
    ? "Loading…"
    : `${state.items.length} shown • ${state.count} total`;

  const currentPresetParams =
    (presets.find((p) => p.key === state.activePresetKey)?.params ?? {}) as StationExtraParams & {
      q?: string;
      ordering?: string;
    };

  const saveParams = useMemo(() => {
    const out: any = { ...(currentPresetParams as any) };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    delete out.page;
    delete out.page_size;

    return out;
  }, [currentPresetParams, state.q, state.ordering]);

  function handleSavePreset(label: string) {
    const key =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ?? `preset_${Date.now()}`;

    const { next, error } = addSavedPreset(PRESET_STORAGE_KEY, savedPresets, {
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

    const next = deleteSavedPreset(PRESET_STORAGE_KEY, savedPresets, key);
    setSavedPresets(next);

    if (state.activePresetKey === key) actions.applyPreset("all");
  }

  const canDeletePreset = (key: string) => !BUILTIN_PRESETS.some((p) => p.key === key);

  return (
    <>
      <h3>Stations</h3>

      <DataTableControls
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
        canDeletePreset={canDeletePreset}
      />

      {state.error ? (
        <div>{state.error}</div>
      ) : (
        <Card className="mt-3">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "name"))}
                  >
                    Name{sortIndicator(state.ordering, "name")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "code"))}
                  >
                    Code{sortIndicator(state.ordering, "code")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      actions.setOrdering(toggleOrdering(state.ordering, "employee_count"))
                    }
                  >
                    Members{sortIndicator(state.ordering, "employee_count")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      actions.setOrdering(toggleOrdering(state.ordering, "is_active"))
                    }
                  >
                    Status{sortIndicator(state.ordering, "is_active")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {state.loading ? (
                  <tr>
                    <td colSpan={4}>Loading…</td>
                  </tr>
                ) : state.items.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No stations found.</td>
                  </tr>
                ) : (
                  state.items.map((s: Station) => (
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

            <div className="d-flex align-items-center justify-content-between">
              <div>
                Page {state.page} of {state.pageCount}
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={state.page <= 1}
                  onClick={() => actions.goToPage(state.page - 1)}
                >
                  ← Prev
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
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

// src/components/makerfex/ProjectsTable.tsx
// ============================================================================
// Reusable ProjectsTable (Server-Driven, Option B)
// ----------------------------------------------------------------------------
// - Canonical server-driven table behavior (q, ordering, pagination)
// - Presets (built-in + saved in localStorage), including extraParams
// - Backend-authoritative filtering (no client-side counts math)
// - Read-only for now
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

import { listProjects, type Project } from "../../api/projects";

type ProjectsExtraParams = {
  // canonical + backend filters
  status?: "active" | "on_hold" | "completed" | "cancelled";
  customer?: string | number;
  customer_id?: string | number;
  station?: string | number;
  station_id?: string | number;
  assigned_to?: string | number;
  assigned_to_id?: string | number;
  current_stage?: string | number;
  stage?: string | number;
  is_completed?: "true" | "false" | boolean;
  overdue?: "1" | "0" | boolean;
  vip?: "1" | "0" | boolean;
};

const STORAGE_KEY = "makerfex.tablepresets.projects";

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All", params: {}, is_builtin: true },
  { key: "active", label: "Active", params: { status: "active" }, is_builtin: true },
  { key: "overdue", label: "Overdue", params: { overdue: "1" }, is_builtin: true },
  { key: "completed", label: "Completed", params: { status: "completed" }, is_builtin: true },
  { key: "cancelled", label: "Cancelled", params: { status: "cancelled" }, is_builtin: true },
  { key: "on_hold", label: "On hold", params: { status: "on_hold" }, is_builtin: true },
  { key: "vip", label: "VIP customers", params: { vip: "1" }, is_builtin: true },
];

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

function toggleOrdering(current: string, field: string): string {
  const asc = current === field;
  const desc = current === `-${field}`;
  if (!asc && !desc) return field;
  if (asc) return `-${field}`;
  return ""; // clear sort
}

function sortIndicator(ordering: string, field: string) {
  if (ordering === field) return " ▲";
  if (ordering === `-${field}`) return " ▼";
  return "";
}

export type ProjectsTableProps = {
  title?: string;

  // Always applied; overrides presets/filters. Useful for embedding later.
  lockedParams?: Partial<ProjectsExtraParams>;

  // Override storage key if you want separate saved preset pools per context.
  presetStorageKey?: string;
};

export default function ProjectsTable({
  title,
  lockedParams,
  presetStorageKey,
}: ProjectsTableProps) {
  const storageKey = presetStorageKey || STORAGE_KEY;

  const [savedPresets, setSavedPresets] = useState<TablePreset[]>(() =>
    loadSavedPresets(storageKey)
  );
  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  const table = useServerDataTable<Project, ProjectsExtraParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    initial: { pageSize: 25 },
    fetcher: async (params) => {
      const merged = cleanMerge(params as any, lockedParams as any);

      const res = await listProjects(merged);
      return { count: res.count ?? 0, results: res.items ?? [] };
    },
  });

  const { state, actions } = table;

  const shownLabel = state.loading
    ? "Loading…"
    : `${state.items.length} shown • ${state.count} total`;

  const currentPresetParams = (presets.find((p) => p.key === state.activePresetKey)?.params ??
    {}) as ProjectsExtraParams;

  const saveParams = useMemo(() => {
    // Save “effective” params: preset params + extraParams + lockedParams,
    // plus current q/ordering (so saved presets round-trip exactly).
    const out: Record<string, any> = {
      ...(currentPresetParams as any),
      ...(state.extraParams as any),
      ...(lockedParams as any),
    };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    // Never persist paging in presets
    delete out.page;
    delete out.page_size;

    // Remove empties
    Object.keys(out).forEach((k) => {
      if (out[k] === undefined || out[k] === null || out[k] === "") delete out[k];
    });

    return out as ProjectsExtraParams;
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
        searchPlaceholder="Search projects…"
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
        savePresetTitle="Save Projects preset"
        savePresetLabel="Preset name"
      />

      {state.error ? (
        <div className="alert alert-danger mt-3 mb-0">{state.error}</div>
      ) : (
        <Card className="mt-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "name"))}
                    >
                      Project{sortIndicator(state.ordering, "name")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "customer__last_name"))
                      }
                    >
                      Customer{sortIndicator(state.ordering, "customer__last_name")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "station__name"))
                      }
                    >
                      Station{sortIndicator(state.ordering, "station__name")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "current_stage__order"))
                      }
                    >
                      Stage{sortIndicator(state.ordering, "current_stage__order")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "status"))
                      }
                    >
                      Status{sortIndicator(state.ordering, "status")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "priority"))
                      }
                    >
                      Priority{sortIndicator(state.ordering, "priority")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "due_date"))
                      }
                    >
                      Due{sortIndicator(state.ordering, "due_date")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "assigned_to__last_name"))
                      }
                    >
                      Assigned{sortIndicator(state.ordering, "assigned_to__last_name")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {state.loading ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center">
                        Loading…
                      </td>
                    </tr>
                  ) : state.items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center">
                        No projects found.
                      </td>
                    </tr>
                  ) : (
                    state.items.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold">{p.name || `Project #${p.id}`}</td>
                        <td>{p.customer_name || "—"}</td>
                        <td>{p.station_name || "—"}</td>
                        <td>{p.current_stage_name || "—"}</td>
                        <td>{p.status}</td>
                        <td>{p.priority}</td>
                        <td>{p.due_date || "—"}</td>
                        <td>{p.assigned_to_name || "—"}</td>
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

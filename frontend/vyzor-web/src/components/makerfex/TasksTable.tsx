// src/components/makerfex/TasksTable.tsx
// ============================================================================
// Reusable TasksTable (Read-only)
// ----------------------------------------------------------------------------
// Purpose:
// - Reuse the canonical server-driven table pattern for Tasks everywhere.
// - Supports presets (saved + built-in), debounced search, sorting, pagination.
// - Supports "locked" params (e.g. { station: 3 } or { project: 12 }) so detail
//   pages can embed a scoped Tasks table without duplicating logic.
// - Optional station/stage dropdown filters (workflow-by-station).
//
// Notes:
// - Non-destructive.
// - Backend is authoritative for filtering/pagination.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Table } from "react-bootstrap";

import { listTasks, type Task } from "../../api/tasks";
import { listStations, type Station } from "../../api/stations";
import { listWorkflowStages, type WorkflowStage } from "../../api/workflows";

import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../tables/DataTableControls";
import {
  addSavedPreset,
  deleteSavedPreset,
  loadSavedPresets,
  type TablePreset,
} from "../tables/tablePresets";

type TaskPresetParams = {
  status?: string; // comma-separated
  project?: string | number;
  station?: string | number;
  stage?: string | number;
  assignee?: string | number;
  unassigned?: "1" | "0";
  is_overdue?: "1" | "0";
  due_before?: string; // YYYY-MM-DD
  due_after?: string; // YYYY-MM-DD
  q?: string;
  ordering?: string;
};

const DEFAULT_PRESET_STORAGE_KEY = "makerfex.tasks.tablePresets";

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All tasks", params: {}, is_builtin: true },

  // Status buckets (backend filters are authoritative)
  { key: "todo", label: "To do", params: { status: "todo" }, is_builtin: true },
  { key: "in_progress", label: "In progress", params: { status: "in_progress" }, is_builtin: true },
  { key: "blocked", label: "Blocked", params: { status: "blocked" }, is_builtin: true },
  { key: "done", label: "Done", params: { status: "done" }, is_builtin: true },
  { key: "cancelled", label: "Cancelled", params: { status: "cancelled" }, is_builtin: true },

  // Operational filters
  { key: "overdue", label: "Overdue", params: { is_overdue: "1" }, is_builtin: true },
  { key: "unassigned", label: "Unassigned", params: { unassigned: "1" }, is_builtin: true },
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

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "done") return <Badge bg="success">Done</Badge>;
  if (s === "cancelled" || s === "canceled") return <Badge bg="secondary">Cancelled</Badge>;
  if (s === "blocked") return <Badge bg="danger">Blocked</Badge>;
  if (s === "in_progress") return <Badge bg="primary">In progress</Badge>;
  if (s === "todo") return <Badge bg="warning" text="dark">To do</Badge>;
  return <Badge bg="light" text="dark">{status || "—"}</Badge>;
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

export type TasksTableProps = {
  title?: string;

  // Locked params always apply and override presets/filters (e.g. station/project scope).
  lockedParams?: Partial<TaskPresetParams>;

  // Show/hide optional workflow filters:
  showStationFilter?: boolean;
  showStageFilter?: boolean;

  // Preset storage key (optional). Use separate keys per context if desired.
  presetStorageKey?: string;
};

export default function TasksTable({
  title,
  lockedParams,
  showStationFilter = true,
  showStageFilter = true,
  presetStorageKey = DEFAULT_PRESET_STORAGE_KEY,
}: TasksTableProps) {
  const [savedPresets, setSavedPresets] = useState<TablePreset[]>(() =>
    loadSavedPresets(presetStorageKey)
  );

  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  // Dropdown data
  const [stations, setStations] = useState<Station[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);

  // Local filter UI state (stored as extraParams via hook actions)
  const [stationFilter, setStationFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("");

  // If station is locked, don't allow a different station filter
  const stationLocked = lockedParams?.station !== undefined && lockedParams?.station !== null && lockedParams?.station !== "";
  const stageLocked = lockedParams?.stage !== undefined && lockedParams?.stage !== null && lockedParams?.stage !== "";

  const table = useServerDataTable<Task, TaskPresetParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    fetcher: async (params) => {
      // Locked params always win
      const merged = cleanMerge(params as any, lockedParams as any);
      const data = await listTasks(merged as any);
      return { count: data.count ?? 0, results: data.items ?? [] };
    },
    initial: { pageSize: 25 },
  });

  const { state, actions } = table;

  // Load dropdown lists (only when shown)
  useEffect(() => {
    if (!showStationFilter || stationLocked) return;
    let alive = true;
    (async () => {
      try {
        const s = await listStations({ page: 1, page_size: 200, ordering: "name" } as any);
        if (!alive) return;
        setStations((s.items ?? []) as Station[]);
      } catch {
        if (!alive) return;
        setStations([]);
      }
    })();
    return () => { alive = false; };
  }, [showStationFilter, stationLocked]);

  useEffect(() => {
    if (!showStageFilter || stageLocked) return;
    let alive = true;
    (async () => {
      try {
        const r = await listWorkflowStages({ page: 1, page_size: 500, ordering: "workflow,order" } as any);
        if (!alive) return;
        setStages((r.items ?? []) as WorkflowStage[]);
      } catch {
        if (!alive) return;
        setStages([]);
      }
    })();
    return () => { alive = false; };
  }, [showStageFilter, stageLocked]);

  // Push dropdown UI → extraParams
  useEffect(() => {
    actions.setExtraParams({
      station: stationLocked ? undefined : (stationFilter || undefined),
      stage: stageLocked ? undefined : (stageFilter || undefined),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationFilter, stageFilter, stationLocked, stageLocked]);

  const shownLabel = state.loading
    ? "Loading…"
    : `${state.items.length} shown • ${state.count} total`;

  const currentPresetParams =
    (presets.find((p) => p.key === state.activePresetKey)?.params ?? {}) as TaskPresetParams;

  // Save presets should capture:
  // - current preset params
  // - extraParams (station/stage filters)
  // - locked params (scope) so saving from a detail page stays scoped
  const saveParams = useMemo(() => {
    const out: TaskPresetParams = {
      ...(currentPresetParams as any),
      ...(state.extraParams as any),
      ...(lockedParams as any),
    };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    delete (out as any).page;
    delete (out as any).page_size;

    return out;
  }, [currentPresetParams, state.extraParams, state.q, state.ordering, lockedParams]);

  function handleSavePreset(label: string) {
    const key =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ?? `preset_${Date.now()}`;

    const { next, error } = addSavedPreset(presetStorageKey, savedPresets, {
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

    const next = deleteSavedPreset(presetStorageKey, savedPresets, key);
    setSavedPresets(next);

    if (state.activePresetKey === key) actions.applyPreset("all");
  }

  const canDeletePreset = (key: string) => !BUILTIN_PRESETS.some((p) => p.key === key);

  return (
    <>
      {title ? <h5 className="mt-4">{title}</h5> : null}

      <DataTableControls
        q={state.q}
        onQChange={(v) => actions.setQ(v)}
        searchPlaceholder="Search tasks…"
        pageSize={state.pageSize}
        onPageSizeChange={(n) => actions.setPageSize(n)}
        shownCountLabel={shownLabel}
        presets={presets}
        activePresetKey={state.activePresetKey}
        onPresetChange={(key) => actions.applyPreset(key)}
        onClearFilters={() => {
          actions.clearFilters();
          setStationFilter("");
          setStageFilter("");
        }}
        onSavePreset={(label) => handleSavePreset(label)}
        onDeletePreset={(key) => handleDeletePreset(key)}
        canDeletePreset={canDeletePreset}
      />

      {(showStationFilter && !stationLocked) || (showStageFilter && !stageLocked) ? (
        <div className="d-flex gap-2 justify-content-end mt-2">
          {showStationFilter && !stationLocked ? (
            <div style={{ minWidth: 220 }}>
              <select
                className="form-select form-select-sm"
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
              >
                <option value="">All stations</option>
                {stations.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showStageFilter && !stageLocked ? (
            <div style={{ minWidth: 240 }}>
              <select
                className="form-select form-select-sm"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">All stages</option>
                {stages.map((st) => (
                  <option key={st.id} value={String(st.id)}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {(stationFilter || stageFilter) && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setStationFilter("");
                setStageFilter("");
                actions.clearExtraParams();
              }}
            >
              Clear
            </Button>
          )}
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-3">{state.error}</div>
      ) : (
        <Card className="mt-3">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "title"))}
                  >
                    Title{sortIndicator(state.ordering, "title")}
                  </th>

                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "status"))}
                  >
                    Status{sortIndicator(state.ordering, "status")}
                  </th>

                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "due_date"))}
                  >
                    Due{sortIndicator(state.ordering, "due_date")}
                  </th>

                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "updated_at"))}
                  >
                    Updated{sortIndicator(state.ordering, "updated_at")}
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
                    <td colSpan={4}>No tasks found.</td>
                  </tr>
                ) : (
                  state.items.map((t: Task) => (
                    <tr key={t.id}>
                      <td>{t.title || `Task #${t.id}`}</td>
                      <td>{statusBadge(t.status)}</td>
                      <td>{t.due_date || "—"}</td>
                      <td>{t.updated_at ? new Date(t.updated_at).toLocaleString() : "—"}</td>
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

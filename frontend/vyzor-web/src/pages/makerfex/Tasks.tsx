// src/pages/makerfex/Tasks.tsx
// ============================================================================
// Makerfex Tasks Page
// ----------------------------------------------------------------------------
// Server-driven data table contract:
// - ?q= search (debounced)
// - ?ordering= sorting
// - ?page= / ?page_size= pagination
// - Presets (Saved + Built-in) are param bundles (backend authoritative)
// - Option B: station/stage filters via useServerDataTable extraParams actions
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Table } from "react-bootstrap";

import { listTasks, type Task } from "../../api/tasks";
import { listStations, type Station } from "../../api/stations";
import { listWorkflowStages, type WorkflowStage } from "../../api/workflows";

import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../../components/tables/DataTableControls";
import {
  addSavedPreset,
  deleteSavedPreset,
  loadSavedPresets,
  type TablePreset,
} from "../../components/tables/tablePresets";

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

const PRESET_STORAGE_KEY = "makerfex.tasks.tablePresets";

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All tasks", params: {}, is_builtin: true },

  // Status buckets (backend filters are authoritative)
  { key: "todo", label: "To do", params: { status: "todo" }, is_builtin: true },
  {
    key: "in_progress",
    label: "In progress",
    params: { status: "in_progress" },
    is_builtin: true,
  },
  { key: "blocked", label: "Blocked", params: { status: "blocked" }, is_builtin: true },
  { key: "done", label: "Done", params: { status: "done" }, is_builtin: true },
  {
    key: "cancelled",
    label: "Cancelled",
    params: { status: "cancelled" },
    is_builtin: true,
  },

  // Operational filters
  { key: "overdue", label: "Overdue", params: { is_overdue: "1" }, is_builtin: true },
  {
    key: "unassigned",
    label: "Unassigned",
    params: { unassigned: "1" },
    is_builtin: true,
  },
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

export default function Tasks() {
  const [savedPresets, setSavedPresets] = useState<TablePreset[]>(() =>
    loadSavedPresets(PRESET_STORAGE_KEY)
  );

  // Filter dropdown data
  const [stations, setStations] = useState<Station[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [stationFilter, setStationFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("");

  // Saved (top) then Built-in (below)
  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  const table = useServerDataTable<Task, TaskPresetParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    fetcher: async (params) => {
      const data = await listTasks(params as any);
      return { count: data.count ?? 0, results: data.items ?? [] };
    },
    initial: {
      pageSize: 25,
      extraParams: {}, // allow future default filters if needed
    },
  });

  const { state, actions } = table;

  // Load stations/stages once
  useEffect(() => {
    (async () => {
      try {
        const s = await listStations({ page: 1, page_size: 200, ordering: "name" } as any);
        setStations((s.items ?? []) as Station[]);
      } catch {
        setStations([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await listWorkflowStages({ page: 1, page_size: 500, ordering: "workflow,order" } as any);
        setStages((r.items ?? []) as WorkflowStage[]);
      } catch {
        setStages([]);
      }
    })();
  }, []);

  // Push dropdown filters into Option B extraParams
  useEffect(() => {
    actions.setExtraParams({
      station: stationFilter || undefined,
      stage: stageFilter || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationFilter, stageFilter]);

  const shownLabel = state.loading
    ? "Loading…"
    : `${state.items.length} shown • ${state.count} total`;

  const currentPresetParams =
    (presets.find((p) => p.key === state.activePresetKey)?.params ?? {}) as TaskPresetParams;

  // Include extraParams in saved preset values (so “save preset” captures station/stage)
  const saveParams = useMemo(() => {
    const out: TaskPresetParams = {
      ...(currentPresetParams as any),
      ...(state.extraParams as any),
    };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    delete (out as any).page;
    delete (out as any).page_size;

    return out;
  }, [currentPresetParams, state.extraParams, state.q, state.ordering]);

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
      <h3>Tasks</h3>

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
          // Clear table state + preset + extra params + dropdown UI
          actions.clearFilters();
          setStationFilter("");
          setStageFilter("");
        }}
        onSavePreset={(label) => handleSavePreset(label)}
        onDeletePreset={(key) => handleDeletePreset(key)}
        canDeletePreset={canDeletePreset}
      />

      {/* Workflow-by-station filters (Option B: extraParams) */}
      <div className="d-flex gap-2 justify-content-end mt-2">
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

// src/pages/makerfex/Tasks.tsx
// ============================================================================
// Makerfex Tasks Page
// ----------------------------------------------------------------------------
// Server-driven data table contract:
// - ?q= search (debounced)
// - ?ordering= sorting
// - ?page= / ?page_size= pagination
// - Presets (Saved + Built-in) are param bundles (backend authoritative)
// ============================================================================

import { useMemo, useState } from "react";
import { Badge, Button, Card, Table } from "react-bootstrap";

import { listTasks, type Task } from "../../api/tasks";
import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../../components/tables/DataTableControls";
import {
  addSavedPreset,
  loadSavedPresets,
  deleteSavedPreset,
  type TablePreset,
} from "../../components/tables/tablePresets";

type TaskPresetParams = {
  status?: string;            // comma-separated
  project?: string | number;
  station?: string | number;
  stage?: string | number;
  assignee?: string | number;
  unassigned?: "1" | "0";
  is_overdue?: "1" | "0";
  due_before?: string;        // YYYY-MM-DD
  due_after?: string;         // YYYY-MM-DD
  q?: string;
  ordering?: string;
};

const PRESET_STORAGE_KEY = "makerfex.tasks.tablePresets";

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

export default function Tasks() {
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
      const data = await listTasks(params as any);
      return { count: data.count ?? 0, results: data.items ?? [] };
    },
  });

  const { state, actions } = table;

  const shownLabel = state.loading
    ? "Loading…"
    : `${state.items.length} shown • ${state.count} total`;

  const currentPresetParams =
    (presets.find((p) => p.key === state.activePresetKey)?.params ?? {}) as TaskPresetParams;

  const saveParams = useMemo(() => {
    const out: TaskPresetParams = { ...(currentPresetParams as any) };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    delete (out as any).page;
    delete (out as any).page_size;

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

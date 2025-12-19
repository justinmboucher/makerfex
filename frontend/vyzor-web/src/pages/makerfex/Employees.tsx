// src/pages/makerfex/Employees.tsx
// ============================================================================
// Makerfex Employees Page
// ----------------------------------------------------------------------------
// Server-driven data table contract:
// - ?q= search (debounced)
// - ?ordering= sorting
// - ?page= / ?page_size= pagination
// - Presets (Saved + Built-in) are param bundles (backend authoritative)
// - Always uses with_counts=1 so workload/overdue columns remain accurate
// ============================================================================

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Table } from "react-bootstrap";

import { listEmployees, type Employee } from "../../api/employees";
import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../../components/tables/DataTableControls";
import {
  addSavedPreset,
  loadSavedPresets,
  deleteSavedPreset,
  type TablePreset,
} from "../../components/tables/tablePresets";

type EmployeeExtraParams = {
  is_active?: 1 | 0;
  with_counts?: 1;
};

type EmployeePresetParams = EmployeeExtraParams & { q?: string; ordering?: string };

const PRESET_STORAGE_KEY = "makerfex.employees.tablePresets";

const BUILTIN_PRESETS: TablePreset[] = [
  { key: "all", label: "All employees", params: {}, is_builtin: true },
  { key: "active", label: "Active only", params: { is_active: 1 }, is_builtin: true },
  { key: "inactive", label: "Inactive only", params: { is_active: 0 }, is_builtin: true },
];

function toggleOrdering(current: string, nextField: string): string {
  const isDesc = current === `-${nextField}`;
  const isAsc = current === nextField;
  if (!isAsc && !isDesc) return nextField;   // none -> asc
  if (isAsc) return `-${nextField}`;         // asc -> desc
  return "";                                  // desc -> none
}

function sortIndicator(ordering: string, field: string): string {
  if (ordering === field) return " ▲";
  if (ordering === `-${field}`) return " ▼";
  return "";
}

function employeeName(e: Employee) {
  const display = (e as any)?.display_name;
  if (display) return display;
  const name = `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim();
  return name || `Employee #${e.id}`;
}

export default function Employees() {
  // 1) Saved presets (soft action storage)
  const [savedPresets, setSavedPresets] = useState<TablePreset[]>(() =>
    loadSavedPresets(PRESET_STORAGE_KEY)
  );

  // 2) Saved first (top), then built-in (below)
  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  // Always-on enrichment
  const extraParams = useMemo(() => ({ with_counts: 1 as const }), []);

  // 3) Server-driven table hook
  const table = useServerDataTable({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    extraParams,
    fetcher: async (params) => {
      const data = await listEmployees(params as any);
      return { count: data.count ?? 0, results: data.items ?? [] };
    },
  });

  const { state, actions } = table;

  const shownLabel = state.loading
    ? "Loading…"
    : `${state.items.length} shown • ${state.count} total`;

  // Save: current effective preset params + q/ordering (never page/page_size)
  const currentPresetParams =
    (presets.find((p) => p.key === state.activePresetKey)?.params ?? {}) as EmployeePresetParams;

  const saveParams = useMemo(() => {
    const out: EmployeePresetParams = { ...(currentPresetParams as any) };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    delete (out as any).page;
    delete (out as any).page_size;

    // with_counts is always on via extraParams, not saved into presets
    delete (out as any).with_counts;

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

  return (
    <>
      <h3>Employees</h3>

      <DataTableControls
        q={state.q}
        onQChange={(v) => actions.setQ(v)}
        searchPlaceholder="Search employees…"
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
        <div>{state.error}</div>
      ) : (
        <>
          <Card className="mt-3">
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        actions.setOrdering(toggleOrdering(state.ordering, "last_name"))
                      }
                    >
                      Name{sortIndicator(state.ordering, "last_name")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "role"))}
                    >
                      Role{sortIndicator(state.ordering, "role")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "email"))}
                    >
                      Email{sortIndicator(state.ordering, "email")}
                    </th>
                    <th>Workload</th>
                    <th>Overdue</th>
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
                      <td colSpan={6}>Loading…</td>
                    </tr>
                  ) : state.items.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No employees found.</td>
                    </tr>
                  ) : (
                    state.items.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <Link to={`/employees/${e.id}`}>{employeeName(e)}</Link>
                        </td>
                        <td>{e.role || "—"}</td>
                        <td>{e.email || "—"}</td>
                        <td>{(e as any).assigned_project_count ?? 0}</td>
                        <td>{(e as any).overdue_project_count ?? 0}</td>
                        <td>
                          {e.is_active ? (
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
        </>
      )}
    </>
  );
}

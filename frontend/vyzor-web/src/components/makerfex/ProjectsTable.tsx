// src/components/makerfex/ProjectsTable.tsx
// ============================================================================
// Reusable ProjectsTable (Server-Driven, Option B)
// ----------------------------------------------------------------------------
// - Canonical server-driven table behavior (q, ordering, pagination)
// - Presets (built-in + saved in localStorage), including extraParams
// - Backend-authoritative filtering (no client-side counts math)
// - Optional dropdown filters (Station / Stage / Status / Assigned)
// - Read-only for now
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import { useServerDataTable } from "../../hooks/useServerDataTable";
import DataTableControls from "../tables/DataTableControls";
import {
  addSavedPreset,
  deleteSavedPreset,
  loadSavedPresets,
  type TablePreset,
} from "../tables/tablePresets";

import { listProjects, type Project } from "../../api/projects";
import { listStations, type Station } from "../../api/stations";
import { listWorkflowStages, type WorkflowStage } from "../../api/workflows";
import { listEmployees, type Employee } from "../../api/employees";

import LogSaleModal from "./LogSaleModal";

type ProjectsExtraParams = {
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

  q?: string;
  ordering?: string;
};

const DEFAULT_STORAGE_KEY = "makerfex.tablepresets.projects";

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

function pillClassForStatus(status?: string) {
  switch (status) {
    case "active":
      return "bg-success-transparent text-success";
    case "on_hold":
      return "bg-warning-transparent text-warning";
    case "completed":
      return "bg-primary-transparent text-primary";
    case "cancelled":
      return "bg-danger-transparent text-danger";
    default:
      return "bg-light text-muted";
  }
}

function pillClassForPriority(priority?: string) {
  switch (priority) {
    case "rush":
      return "bg-danger-transparent text-danger";
    case "high":
      return "bg-warning-transparent text-warning";
    case "normal":
      return "bg-primary-transparent text-primary";
    case "low":
      return "bg-success-transparent text-success";
    default:
      return "bg-light text-muted";
  }
}

export type ProjectsTableProps = {
  title?: string;

  // Always applied; overrides presets/filters. Useful for embedding later.
  lockedParams?: Partial<ProjectsExtraParams>;

  // Override storage key if you want separate saved preset pools per context.
  presetStorageKey?: string;

  // Optional filter toggles (mirror TasksTable pattern)
  showStationFilter?: boolean;
  showStageFilter?: boolean;
  showStatusFilter?: boolean;
  showAssigneeFilter?: boolean;
};

export default function ProjectsTable({
  title,
  lockedParams,
  presetStorageKey = DEFAULT_STORAGE_KEY,
  showStationFilter = true,
  showStageFilter = true,
  showStatusFilter = true,
  showAssigneeFilter = true,
}: ProjectsTableProps) {
  const navigate = useNavigate();

  // ---- Log Sale (reusable modal) ------------------------------------------
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleProject, setSaleProject] = useState<Project | null>(null);

  function openSaleModal(p: Project) {
    setSaleProject(p);
    setShowSaleModal(true);
  }

  function closeSaleModal() {
    setShowSaleModal(false);
    setSaleProject(null);
  }

  // -------------------------------------------------------------------------

  // Saved presets
  const [savedPresets, setSavedPresets] = useState<TablePreset[]>(() =>
    loadSavedPresets(presetStorageKey)
  );
  const presets = useMemo(() => [...savedPresets, ...BUILTIN_PRESETS], [savedPresets]);

  // Dropdown data
  const [stations, setStations] = useState<Station[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Local filter UI state (stored as extraParams via hook actions)
  const [stationFilter, setStationFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  // If locked, do not allow changing
  const stationLocked = lockedParams?.station != null && String(lockedParams.station) !== "";
  const stageLocked =
    lockedParams?.current_stage != null && String(lockedParams.current_stage) !== "";
  const assigneeLocked =
    lockedParams?.assigned_to != null && String(lockedParams.assigned_to) !== "";
  const statusLocked = lockedParams?.status != null; // no "" check

  const table = useServerDataTable<Project, ProjectsExtraParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 250,
    initial: { pageSize: 25 },
    fetcher: async (params) => {
      // Locked params always win
      const merged = cleanMerge(params as any, lockedParams as any);
      const res = await listProjects(merged);
      return { count: res.count ?? 0, results: res.items ?? [] };
    },
  });

  const { state, actions } = table;

  // Load dropdown lists
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
    return () => {
      alive = false;
    };
  }, [showStationFilter, stationLocked]);

  useEffect(() => {
    if (!showStageFilter || stageLocked) return;
    let alive = true;
    (async () => {
      try {
        const r = await listWorkflowStages({
          page: 1,
          page_size: 500,
          ordering: "workflow,order",
        } as any);
        if (!alive) return;
        setStages((r.items ?? []) as WorkflowStage[]);
      } catch {
        if (!alive) return;
        setStages([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [showStageFilter, stageLocked]);

  useEffect(() => {
    if (!showAssigneeFilter || assigneeLocked) return;
    let alive = true;
    (async () => {
      try {
        const r = await listEmployees({
          page: 1,
          page_size: 300,
          ordering: "last_name,first_name",
        } as any);
        if (!alive) return;
        setEmployees((r.items ?? []) as Employee[]);
      } catch {
        if (!alive) return;
        setEmployees([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [showAssigneeFilter, assigneeLocked]);

  // Push dropdown UI → extraParams (Option B)
  useEffect(() => {
    actions.setExtraParams({
      station: stationLocked ? undefined : stationFilter || undefined,
      current_stage: stageLocked ? undefined : stageFilter || undefined,
      status: statusLocked ? undefined : ((statusFilter as any) || undefined),
      assigned_to: assigneeLocked ? undefined : assigneeFilter || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stationFilter,
    stageFilter,
    statusFilter,
    assigneeFilter,
    stationLocked,
    stageLocked,
    statusLocked,
    assigneeLocked,
  ]);

  const shownLabel = state.loading ? "Loading…" : `${state.items.length} shown • ${state.count} total`;

  const currentPresetParams = (presets.find((p) => p.key === state.activePresetKey)?.params ??
    {}) as ProjectsExtraParams;

  const saveParams = useMemo(() => {
    const out: ProjectsExtraParams = {
      ...(currentPresetParams as any),
      ...(state.extraParams as any),
      ...(lockedParams as any),
    };

    const qTrim = state.q.trim();
    if (qTrim) out.q = qTrim;
    if (state.ordering) out.ordering = state.ordering;

    // Never persist paging in presets
    delete (out as any).page;
    delete (out as any).page_size;

    // Clean empties
    Object.keys(out).forEach((k) => {
      const v = (out as any)[k];
      if (v === undefined || v === null || v === "") delete (out as any)[k];
    });

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

  const anyLocalFilters = !!stationFilter || !!stageFilter || !!statusFilter || !!assigneeFilter;

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
        onClearFilters={() => {
          actions.clearFilters();
          setStationFilter("");
          setStageFilter("");
          setStatusFilter("");
          setAssigneeFilter("");
        }}
        onSavePreset={(label) => handleSavePreset(label)}
        onDeletePreset={(key) => handleDeletePreset(key)}
        canDeletePreset={canDeletePreset}
        savePresetTitle="Save Projects preset"
        savePresetLabel="Preset name"
      />

      {/* Inline filter row (mirrors TasksTable pattern) */}
      {(showStationFilter && !stationLocked) ||
      (showStageFilter && !stageLocked) ||
      (showStatusFilter && !statusLocked) ||
      (showAssigneeFilter && !assigneeLocked) ? (
        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
          {showStationFilter && !stationLocked ? (
            <Form.Select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              style={{ width: 220 }}
              aria-label="Filter by station"
            >
              <option value="">All stations</option>
              {stations.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </Form.Select>
          ) : null}

          {showStageFilter && !stageLocked ? (
            <Form.Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              style={{ width: 220 }}
              aria-label="Filter by stage"
            >
              <option value="">All stages</option>
              {stages.map((st) => (
                <option key={st.id} value={String(st.id)}>
                  {st.name}
                </option>
              ))}
            </Form.Select>
          ) : null}

          {showStatusFilter && !statusLocked ? (
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 180 }}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          ) : null}

          {showAssigneeFilter && !assigneeLocked ? (
            <Form.Select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              style={{ width: 220 }}
              aria-label="Filter by assignee"
            >
              <option value="">All assignees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {(emp.display_name && emp.display_name.trim()) ||
                    `${emp.last_name}, ${emp.first_name}`}
                </option>
              ))}
            </Form.Select>
          ) : null}

          {anyLocalFilters ? (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => {
                setStationFilter("");
                setStageFilter("");
                setStatusFilter("");
                setAssigneeFilter("");
                actions.clearExtraParams();
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      ) : null}

      {state.error ? (
        <div className="alert alert-danger mt-3 mb-0">{state.error}</div>
      ) : (
        <Card className="mt-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover striped className="mb-0">
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
                      onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "status"))}
                    >
                      Status{sortIndicator(state.ordering, "status")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "priority"))}
                    >
                      Priority{sortIndicator(state.ordering, "priority")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => actions.setOrdering(toggleOrdering(state.ordering, "due_date"))}
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
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {state.loading ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center">
                        Loading…
                      </td>
                    </tr>
                  ) : state.items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center">
                        No projects found.
                      </td>
                    </tr>
                  ) : (
                    state.items.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
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
                              {p.photo_url ? (
                                <img
                                  src={p.photo_url}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <div style={{ width: "100%", height: "100%" }} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="fw-semibold text-truncate">
                                <Link to={`/projects/${p.id}`} className="text-decoration-none">
                                  {p.name || `Project #${p.id}`}
                                </Link>
                              </div>
                              <div className="text-muted small">Ref: {p.reference_code || "—"}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          {p.customer && p.customer_name ? (
                            <Link to={`/customers/${p.customer}`} className="text-decoration-none">
                              {p.customer_name}
                            </Link>
                          ) : (
                            p.customer_name || "—"
                          )}
                        </td>

                        <td>
                          {p.station && p.station_name ? (
                            <Link to={`/stations/${p.station}`} className="text-decoration-none">
                              {p.station_name}
                            </Link>
                          ) : (
                            p.station_name || "—"
                          )}
                        </td>

                        <td>
                          {p.current_stage_name ? (
                            <span className="badge bg-secondary-transparent">{p.current_stage_name}</span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          <span className={`badge ${pillClassForStatus(p.status)}`}>{p.status}</span>
                        </td>

                        <td>
                          <span className={`badge ${pillClassForPriority(p.priority)}`}>
                            {p.priority}
                          </span>
                        </td>

                        <td>{p.due_date || "—"}</td>
                        <td>{p.assigned_to_name || "—"}</td>

                        <td className="text-nowrap">
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="btn-icon"
                              disabled={!Boolean((p as any).can_log_sale)}
                              onClick={() => openSaleModal(p)}
                              title={
                                Boolean((p as any).can_log_sale)
                                  ? "Log sale"
                                  : "Complete the final stage to enable"
                              }
                            >
                              <i className="ri-shopping-bag-3-line" />
                            </Button>

                            <Button
                              as={Link as any}
                              to={`/projects/${p.id}`}
                              size="sm"
                              variant="outline-primary"
                              className="btn-icon"
                              title="View project"
                            >
                              <i className="ri-eye-line" />
                            </Button>
                          </div>
                        </td>
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

      <LogSaleModal
        show={showSaleModal}
        onHide={closeSaleModal}
        projectId={saleProject?.id ?? null}
        projectName={saleProject?.name ?? null}
        project={saleProject}   // ✅ add this
        onSuccess={(order) => navigate(`/sales/${order.id}`)}
      />
    </>
  );
}

// src/pages/makerfex/Projects.tsx
// ============================================================================
// Makerfex Projects Page (Vyzor Shell)
// ----------------------------------------------------------------------------
// Standard server-driven table contract (backend authoritative):
// - ?q= search (debounced)
// - ?ordering= sorting
// - ?page= / ?page_size= pagination
// - Filters are backend-driven (station/customer/assigned/current_stage/is_completed/vip)
// - Presets: Saved (local) + Built-in, managed through shared DataTableControls
// - URL stays in sync for shareable views + back/forward navigation
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Form, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { listProjects } from "../../api/projects";
import type { Project } from "../../api/projects";

import { listStations, type Station } from "../../api/stations";
import { listEmployees, type Employee, getMyEmployee } from "../../api/employees";
import { listCustomers, type Customer } from "../../api/customers";
import { listStages, type WorkflowStage } from "../../api/workflows";

import DataTableControls from "../../components/tables/DataTableControls";
import {
  addSavedPreset,
  loadSavedPresets,
  deleteSavedPreset,
  type TablePreset,
} from "../../components/tables/tablePresets";
import { useServerDataTable } from "../../hooks/useServerDataTable";

function unwrapItems<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

function priorityVariant(priority: Project["priority"]) {
  switch (priority) {
    case "rush":
      return "danger";
    case "high":
      return "warning";
    case "normal":
      return "info";
    case "low":
      return "secondary";
    default:
      return "light";
  }
}

function cleanIdParam(v: string | null): string {
  if (!v) return "";
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? String(n) : "";
}

function parseIntParam(v: string | null, fallback: number) {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function parsePageSize(v: string | null) {
  const n = parseIntParam(v, 25);
  if ([10, 25, 50, 100].includes(n)) return n;
  return 25;
}

// Ordering helpers
function toggleOrdering(current: string, field: string) {
  if (!current) return field; // default asc
  if (current === field) return `-${field}`; // toggle to desc
  if (current === `-${field}`) return field; // toggle to asc
  return field;
}

function orderingIcon(current: string, field: string) {
  if (current === field) return <i className="ri-arrow-up-s-line" />;
  if (current === `-${field}`) return <i className="ri-arrow-down-s-line" />;
  return <i className="ri-arrow-up-down-line" />;
}

type PresetParams = {
  station?: number;
  customer?: number;
  assigned_to?: number;
  current_stage?: number;
  vip?: "1";
  is_completed?: "true" | "false";
  q?: string;
  ordering?: string;
};

const PRESET_STORAGE_KEY = "mf.projects.saved_presets";

const BUILTIN_PRESETS: TablePreset<PresetParams>[] = [
  { key: "all", label: "All projects", params: {}, is_builtin: true },
  // assigned_to_me is special-cased (needs employee lookup)
  { key: "assigned_to_me", label: "Assigned to Me", params: {}, is_builtin: true },
  { key: "vip_customers", label: "VIP Customers", params: { vip: "1" }, is_builtin: true },
  { key: "in_progress", label: "In Progress", params: { is_completed: "false" }, is_builtin: true },
  { key: "completed", label: "Completed", params: { is_completed: "true" }, is_builtin: true },
];

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const didInitFromUrl = useRef(false);

  // Page-level filters (kept as strings for selects; converted to numbers for backend)
  const [stationId, setStationId] = useState(() => cleanIdParam(searchParams.get("station")));
  const [customerId, setCustomerId] = useState(() => cleanIdParam(searchParams.get("customer")));
  const [assignedToId, setAssignedToId] = useState(() => cleanIdParam(searchParams.get("assigned_to")));
  const [stageId, setStageId] = useState(() => cleanIdParam(searchParams.get("current_stage")));

  // Completion filter (backend truth)
  const [isCompleted, setIsCompleted] = useState<"" | "true" | "false">(() => {
    const v = searchParams.get("is_completed");
    return v === "true" || v === "false" ? v : "";
  });

  // VIP is backend-driven (?vip=1)
  const [vipOnly, setVipOnly] = useState(() => searchParams.get("vip") === "1");

  // Option lists
  const [stations, setStations] = useState<Station[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);

  // Presets: saved + built-in
  const [savedPresets, setSavedPresets] = useState<TablePreset<PresetParams>[]>(() =>
    loadSavedPresets<PresetParams>(PRESET_STORAGE_KEY)
  );

  const presets = useMemo(() => {
    // Saved first (used most), then built-in
    return [...savedPresets, ...BUILTIN_PRESETS];
  }, [savedPresets]);

  // Hook extraParams are page-level filters (backend authoritative)
  const extraParams = useMemo(() => {
    const p: PresetParams = {};
    if (stationId) p.station = Number(stationId);
    if (customerId) p.customer = Number(customerId);
    if (assignedToId) p.assigned_to = Number(assignedToId);
    if (stageId) p.current_stage = Number(stageId);
    if (isCompleted) p.is_completed = isCompleted;
    if (vipOnly) p.vip = "1";
    return p;
  }, [stationId, customerId, assignedToId, stageId, isCompleted, vipOnly]);

  // Shared server table (q/ordering/page/page_size are inside the hook)
  const table = useServerDataTable<Project, PresetParams>({
    presets,
    defaultPresetKey: "all",
    debounceMs: 350,
    extraParams,
    initial: {
      q: searchParams.get("q") || "",
      ordering: searchParams.get("ordering") || "",
      page: parseIntParam(searchParams.get("page"), 1),
      pageSize: parsePageSize(searchParams.get("page_size")),
    },
    fetcher: async (params) => {
      const res = await listProjects(params as any);
      return { count: res.count ?? 0, results: res.items || [] };
    },
  });

  const { state, actions } = table;

  // Load dropdown options once
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [stationsRes, employeesRes, customersRes, stagesRes] = await Promise.all([
          listStations(),
          listEmployees({ with_counts: 0 } as any),
          listCustomers(),
          listStages(),
        ]);

        if (!alive) return;
        setStations(unwrapItems<Station>(stationsRes));
        setEmployees(unwrapItems<Employee>(employeesRes));
        setCustomers(unwrapItems<Customer>(customersRes));
        setStages(unwrapItems<WorkflowStage>(stagesRes));
      } catch {
        if (!alive) return;
        setStations([]);
        setEmployees([]);
        setCustomers([]);
        setStages([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // URL -> state (back/forward)
  useEffect(() => {
    const nextStation = cleanIdParam(searchParams.get("station"));
    const nextCustomer = cleanIdParam(searchParams.get("customer"));
    const nextAssigned = cleanIdParam(searchParams.get("assigned_to"));
    const nextStage = cleanIdParam(searchParams.get("current_stage"));
    const nextVip = searchParams.get("vip") === "1";

    const nextIsCompleted = (() => {
      const v = searchParams.get("is_completed");
      return v === "true" || v === "false" ? (v as "true" | "false") : "";
    })();

    const nextQ = searchParams.get("q") || "";
    const nextOrdering = searchParams.get("ordering") || "";
    const nextPage = parseIntParam(searchParams.get("page"), 1);
    const nextPageSize = parsePageSize(searchParams.get("page_size"));

    if (nextStation !== stationId) setStationId(nextStation);
    if (nextCustomer !== customerId) setCustomerId(nextCustomer);
    if (nextAssigned !== assignedToId) setAssignedToId(nextAssigned);
    if (nextStage !== stageId) setStageId(nextStage);
    if (nextVip !== vipOnly) setVipOnly(nextVip);
    if (nextIsCompleted !== isCompleted) setIsCompleted(nextIsCompleted);

    if (nextQ !== state.q) actions.setQ(nextQ);
    if (nextOrdering !== state.ordering) actions.setOrdering(nextOrdering);
    if (nextPage !== state.page) actions.setPage(nextPage);
    if (nextPageSize !== state.pageSize) actions.setPageSize(nextPageSize);

    didInitFromUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // State -> URL (persist)
  useEffect(() => {
    if (!didInitFromUrl.current) return;

    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key: string, val: string) => {
      if (val) next.set(key, val);
      else next.delete(key);
    };

    setOrDelete("station", stationId);
    setOrDelete("customer", customerId);
    setOrDelete("assigned_to", assignedToId);
    setOrDelete("current_stage", stageId);
    setOrDelete("is_completed", isCompleted);
    setOrDelete("vip", vipOnly ? "1" : "");
    setOrDelete("q", state.q.trim());
    setOrDelete("ordering", state.ordering);
    setOrDelete("page", String(state.page));
    setOrDelete("page_size", String(state.pageSize));

    const currentStr = searchParams.toString();
    const nextStr = next.toString();
    if (currentStr !== nextStr) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stationId,
    customerId,
    assignedToId,
    stageId,
    isCompleted,
    vipOnly,
    state.q,
    state.ordering,
    state.page,
    state.pageSize,
  ]);

  // Sorting: map columns to backend ordering fields
  const sortFields = {
    name: "name",
    stage: "current_stage__order",
    priority: "priority",
    due: "due_date",
    station: "station__name",
    customer: "customer__last_name",
    assigned: "assigned_to__last_name",
  } as const;

  function onSort(field: keyof typeof sortFields) {
    actions.setOrdering(toggleOrdering(state.ordering, sortFields[field]));
    actions.setPage(1);
  }

  const shownLabel = state.loading ? "Loading…" : `${state.items.length} shown • ${state.count} total`;

  function clearAll() {
    setStationId("");
    setCustomerId("");
    setAssignedToId("");
    setStageId("");
    setIsCompleted("");
    setVipOnly(false);
    actions.clearFilters(); // clears q/ordering/page/pageSize + preset key
    setSearchParams({}, { replace: true });
  }

  function applyPresetToFilterState(params: PresetParams) {
    // Ensure UI selects reflect preset (so extraParams doesn't override it)
    setStationId(params.station ? String(params.station) : "");
    setCustomerId(params.customer ? String(params.customer) : "");
    setAssignedToId(params.assigned_to ? String(params.assigned_to) : "");
    setStageId(params.current_stage ? String(params.current_stage) : "");
    setIsCompleted(params.is_completed ?? "");
    setVipOnly(params.vip === "1");
    actions.setPage(1);
  }

  async function handlePresetChange(key: string) {
    // Special-case Assigned to Me
    if (key === "assigned_to_me") {
      try {
        const me = await getMyEmployee();
        const meId = me?.id ? Number(me.id) : 0;
        actions.applyPreset(key);
        applyPresetToFilterState({ assigned_to: meId || undefined });
      } catch {
        // Apply preset key anyway; filter state unchanged if lookup fails
        actions.applyPreset(key);
      }
      return;
    }

    const hit = presets.find((p) => p.key === key);
    actions.applyPreset(key);
    applyPresetToFilterState((hit?.params ?? {}) as PresetParams);
  }

  function handleSavePreset(label: string) {
    const key =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ??
      `preset_${Date.now()}`;

    // Save the effective current filters (extraParams) + q/ordering
    const paramsToSave: PresetParams = {
      ...extraParams,
      q: state.q.trim() || undefined,
      ordering: state.ordering || undefined,
    };

    const { next, error } = addSavedPreset<PresetParams>(PRESET_STORAGE_KEY, savedPresets, {
      key,
      label,
      params: paramsToSave,
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

    const next = deleteSavedPreset<PresetParams>(PRESET_STORAGE_KEY, savedPresets, key);
    setSavedPresets(next);

    if (state.activePresetKey === key) actions.applyPreset("all");
  }

  const employeeLabel = (e: Employee) => {
    const anyE: any = e as any;
    return (
      anyE.display_name ||
      `${anyE.first_name ?? ""} ${anyE.last_name ?? ""}`.trim() ||
      anyE.email ||
      `Employee #${anyE.id}`
    );
  };

  const customerLabel = (c: Customer) => {
    const anyC: any = c as any;
    return anyC.name || anyC.display_name || `Customer #${anyC.id}`;
  };

  const stationLabel = (s: Station) => {
    const anyS: any = s as any;
    return anyS.name || `Station #${anyS.id}`;
  };

  const stageLabel = (st: WorkflowStage) => {
    const anySt: any = st as any;
    return anySt.name || `Stage #${anySt.id}`;
  };

  const customerById = useMemo(() => {
    const map = new Map<number, any>();
    for (const c of customers as any[]) {
      if (c?.id != null) map.set(Number(c.id), c);
    }
    return map;
  }, [customers]);

  const customerIsVip = (c: any): boolean => !!(c?.is_vip ?? c?.vip ?? c?.isVIP ?? false);

  const pageCount = state.pageCount;

  return (
    <>
      <h3 className="mb-3">Makerfex Projects</h3>

      <DataTableControls<PresetParams>
        q={state.q}
        onQChange={(v) => actions.setQ(v)}
        searchPlaceholder="Search projects…"
        afterSearch={
          <>
            {/* Station */}
            <Form.Select
              size="sm"
              style={{ width: 200 }}
              value={stationId}
              onChange={(e) => {
                setStationId(e.target.value);
                actions.setPage(1);
              }}
            >
              <option value="">All stations</option>
              {stations.map((s: any) => (
                <option key={s.id} value={String(s.id)}>
                  {stationLabel(s)}
                </option>
              ))}
            </Form.Select>

            {/* Stage */}
            <Form.Select
              size="sm"
              style={{ width: 200 }}
              value={stageId}
              onChange={(e) => {
                setStageId(e.target.value);
                actions.setPage(1);
              }}
            >
              <option value="">All stages</option>
              {stages.map((st: any) => (
                <option key={st.id} value={String(st.id)}>
                  {stageLabel(st)}
                </option>
              ))}
            </Form.Select>

            {/* State */}
            <Form.Select
              size="sm"
              style={{ width: 160 }}
              value={isCompleted}
              onChange={(e) => {
                const v = e.target.value as "" | "true" | "false";
                setIsCompleted(v);
                actions.setPage(1);
              }}
            >
              <option value="">Any state</option>
              <option value="false">In Progress</option>
              <option value="true">Completed</option>
            </Form.Select>

            {/* Customer */}
            <Form.Select
              size="sm"
              style={{ width: 220 }}
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                actions.setPage(1);
              }}
            >
              <option value="">All customers</option>
              {customers.map((c: any) => (
                <option key={c.id} value={String(c.id)}>
                  {customerLabel(c)}
                </option>
              ))}
            </Form.Select>

            {/* Assigned */}
            <Form.Select
              size="sm"
              style={{ width: 220 }}
              value={assignedToId}
              onChange={(e) => {
                setAssignedToId(e.target.value);
                actions.setPage(1);
              }}
            >
              <option value="">Anyone</option>
              {employees.map((e: any) => (
                <option key={e.id} value={String(e.id)}>
                  {employeeLabel(e)}
                </option>
              ))}
            </Form.Select>

            {/* VIP */}
            <Form.Check
              type="checkbox"
              label="VIP"
              checked={vipOnly}
              onChange={(e) => {
                setVipOnly(e.target.checked);
                actions.setPage(1);
              }}
            />
          </>
        }
        pageSize={state.pageSize}
        onPageSizeChange={(n) => actions.setPageSize(n)}
        shownCountLabel={shownLabel}
        presets={presets}
        activePresetKey={state.activePresetKey}
        onPresetChange={(key) => handlePresetChange(key)}
        onSavePreset={(label) => handleSavePreset(label)}
        onDeletePreset={(key) => handleDeletePreset(key)}
        canDeletePreset={(key) => !BUILTIN_PRESETS.some((p) => p.key === key)}
        onClearFilters={() => clearAll()}
      />

      {/* Results */}
      {state.loading && (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading projects…</span>
        </div>
      )}

      {state.error && <div className="text-danger">{state.error}</div>}

      {!state.loading && !state.error && (
        <>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("name")}>
                    Name {orderingIcon(state.ordering, sortFields.name)}
                  </Button>
                </th>

                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("stage")}>
                    Stage {orderingIcon(state.ordering, sortFields.stage)}
                  </Button>
                </th>

                <th>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none"
                    onClick={() => onSort("priority")}
                  >
                    Priority {orderingIcon(state.ordering, sortFields.priority)}
                  </Button>
                </th>

                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("due")}>
                    Due {orderingIcon(state.ordering, sortFields.due)}
                  </Button>
                </th>

                <th>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none"
                    onClick={() => onSort("station")}
                  >
                    Station {orderingIcon(state.ordering, sortFields.station)}
                  </Button>
                </th>

                <th>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none"
                    onClick={() => onSort("customer")}
                  >
                    Customer {orderingIcon(state.ordering, sortFields.customer)}
                  </Button>
                </th>

                <th>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none"
                    onClick={() => onSort("assigned")}
                  >
                    Assigned {orderingIcon(state.ordering, sortFields.assigned)}
                  </Button>
                </th>

                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {state.items.map((p) => {
                const c = p.customer ? customerById.get(Number(p.customer)) : null;
                const isVip = c ? customerIsVip(c) : false;

                const stageName = (p as any).current_stage_name ?? "—";
                const stageIsCompleted = Boolean((p as any).is_completed);
                const canLogSale = Boolean((p as any).can_log_sale);

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.photo_url ? (
                          <img
                            src={p.photo_url}
                            alt=""
                            style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 8, flex: "0 0 auto" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: "rgba(0,0,0,0.06)",
                              flex: "0 0 auto",
                            }}
                            title="No photo"
                          />
                        )}

                        <div className="min-w-0">
                          <div className="fw-semibold">
                            <Link to={`/projects/${p.id}`}>{p.name}</Link>
                          </div>
                          {p.reference_code ? <div className="text-muted">Ref: {p.reference_code}</div> : null}
                        </div>
                      </div>
                    </td>

                    <td>
                      <Badge bg={stageIsCompleted ? "success" : "primary"}>{stageName}</Badge>
                    </td>

                    <td>
                      <Badge bg={priorityVariant(p.priority)}>{p.priority}</Badge>
                    </td>

                    <td>{formatDate(p.due_date)}</td>

                    <td>
                      {p.station ? (
                        <Link to={`/stations/${p.station}`}>{p.station_name ?? `Station #${p.station}`}</Link>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      {p.customer ? (
                        <>
                          <Link to={`/customers/${p.customer}`}>{p.customer_name ?? `Customer #${p.customer}`}</Link>
                          {isVip ? (
                            <Badge bg="warning" text="dark" className="ms-2">
                              VIP
                            </Badge>
                          ) : null}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      {p.assigned_to ? (
                        <Link to={`/employees/${p.assigned_to}`}>
                          {p.assigned_to_name ?? `Employee #${p.assigned_to}`}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant={canLogSale ? "success" : "outline-secondary"}
                          disabled={!canLogSale}
                          className="px-2"
                          aria-label="Log sale"
                          title={canLogSale ? "Log sale" : `Sale logging is disabled at this stage (${stageName}).`}
                          onClick={() => alert("Log Sale is not implemented yet. (Gate is working ✅)")}
                        >
                          <i className="bi bi-currency-dollar" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="px-2"
                          aria-label="View project"
                          title="View project"
                          onClick={() => navigate(`/projects/${p.id}`)}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {state.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination controls */}
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div className="text-muted">
              Page <strong>{state.page}</strong> of <strong>{pageCount}</strong>
            </div>

            <div className="d-flex align-items-center gap-2">
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
                disabled={state.page >= pageCount}
                onClick={() => actions.goToPage(state.page + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

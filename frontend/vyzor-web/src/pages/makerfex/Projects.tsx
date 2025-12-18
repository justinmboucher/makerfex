// src/pages/makerfex/Projects.tsx
// ============================================================================
// Makerfex Projects Page (Vyzor Shell)
// ----------------------------------------------------------------------------
// Adds:
// - Server-side free-text search (?q=) w/ debounce
// - Server-side sorting (?ordering=) asc/desc for all non-action columns
// - Server-side pagination (?page=) + page size (?page_size= 10/25/50/100; default 25)
// - VIP filter moved to backend (?vip=1) so count/paging stays correct
// - Preset dropdown indentation for clarity
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Dropdown, Form, Modal, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { listProjects } from "../../api/projects";
import type { Project } from "../../api/projects";

import { listStations, type Station } from "../../api/stations";
import { listEmployees, type Employee, getMyEmployee } from "../../api/employees";
import { listCustomers, type Customer } from "../../api/customers";
import { listStages, type WorkflowStage } from "../../api/workflows";

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

function normalize(s: string) {
  return (s || "").trim().toLowerCase();
}

type BuiltinPreset = {
  key: "all" | "assigned_to_me" | "vip_customers" | "in_progress" | "completed";
  label: string;
};

type PresetParams = {
  station?: string;
  customer?: string;
  assigned_to?: string;
  current_stage?: string;
  vip?: "1";
  is_completed?: "true" | "false";
};

type SavedPreset = {
  key: string;
  label: string;
  params: PresetParams;
};

const SAVED_PRESETS_LS_KEY = "mf.projects.saved_presets";

const BUILTIN_PRESETS: BuiltinPreset[] = [
  { key: "all", label: "All projects" },
  { key: "assigned_to_me", label: "Assigned to Me" },
  { key: "vip_customers", label: "VIP Customers" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

function loadSavedPresets(): SavedPreset[] {
  try {
    const raw = localStorage.getItem(SAVED_PRESETS_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedPreset[]) : [];
  } catch {
    return [];
  }
}

function persistSavedPresets(presets: SavedPreset[]) {
  try {
    localStorage.setItem(SAVED_PRESETS_LS_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
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

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const didInitFromUrl = useRef(false);

  // Core filter states
  const [stationId, setStationId] = useState(() => cleanIdParam(searchParams.get("station")));
  const [customerId, setCustomerId] = useState(() => cleanIdParam(searchParams.get("customer")));
  const [assignedToId, setAssignedToId] = useState(() => cleanIdParam(searchParams.get("assigned_to")));
  const [stageId, setStageId] = useState(() => cleanIdParam(searchParams.get("current_stage")));

  // Completion filter (stage-truth)
  const [isCompleted, setIsCompleted] = useState<"" | "true" | "false">(() => {
    const v = searchParams.get("is_completed");
    return v === "true" || v === "false" ? v : "";
  });

  // VIP is now backend-driven
  const [vipOnly, setVipOnly] = useState(() => searchParams.get("vip") === "1");

  // Search (server-side)
  const [q, setQ] = useState(() => searchParams.get("q") || "");
  const qDebounceRef = useRef<number | null>(null);

  // Sorting (server-side)
  const [ordering, setOrdering] = useState(() => searchParams.get("ordering") || "");

  // Pagination (server-side)
  const [page, setPage] = useState(() => parseIntParam(searchParams.get("page"), 1));
  const [pageSize, setPageSize] = useState(() => parsePageSize(searchParams.get("page_size")));

  // Data state
  const [items, setItems] = useState<Project[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Option lists
  const [stations, setStations] = useState<Station[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);

  // Presets
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() => loadSavedPresets());
  const [activePresetLabel, setActivePresetLabel] = useState<string | null>(null);

  // Save preset modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetNameErr, setPresetNameErr] = useState<string | null>(null);

  const employeeLabel = (e: Employee) => {
    const anyE: any = e as any;
    return anyE.display_name || `${anyE.first_name ?? ""} ${anyE.last_name ?? ""}`.trim() || anyE.email || `Employee #${anyE.id}`;
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

  const customerIsVip = (c: any): boolean => !!(c?.is_vip ?? c?.vip ?? c?.isVIP ?? false);

  const hasAnyFilters =
    !!stationId || !!customerId || !!assignedToId || !!stageId || !!isCompleted || vipOnly || !!q.trim() || !!ordering || page !== 1 || pageSize !== 25;

  const pageCount = useMemo(() => Math.max(1, Math.ceil((count || 0) / pageSize)), [count, pageSize]);

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

    if (nextQ !== q) setQ(nextQ);
    if (nextOrdering !== ordering) setOrdering(nextOrdering);
    if (nextPage !== page) setPage(nextPage);
    if (nextPageSize !== pageSize) setPageSize(nextPageSize);

    didInitFromUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    setOrDelete("q", q.trim());
    setOrDelete("ordering", ordering);
    setOrDelete("page", String(page));
    setOrDelete("page_size", String(pageSize));

    const currentStr = searchParams.toString();
    const nextStr = next.toString();
    if (currentStr !== nextStr) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, customerId, assignedToId, stageId, isCompleted, vipOnly, q, ordering, page, pageSize]);

  // Debounce q -> reset page and clear preset indicator
  useEffect(() => {
    if (!didInitFromUrl.current) return;

    if (qDebounceRef.current) window.clearTimeout(qDebounceRef.current);
    qDebounceRef.current = window.setTimeout(() => {
      // When searching, always jump to page 1
      setPage(1);
      setActivePresetLabel(null);
    }, 350);

    return () => {
      if (qDebounceRef.current) window.clearTimeout(qDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Fetch projects
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const params: Record<string, any> = {
          page,
          page_size: pageSize,
        };

        if (stationId) params.station = Number(stationId);
        if (customerId) params.customer = Number(customerId);
        if (assignedToId) params.assigned_to = Number(assignedToId);
        if (stageId) params.current_stage = Number(stageId);
        if (isCompleted) params.is_completed = isCompleted;
        if (vipOnly) params.vip = 1;

        if (q.trim()) params.q = q.trim();
        if (ordering) params.ordering = ordering;

        const res = await listProjects(params);

        if (!alive) return;
        setItems(res.items || []);
        setCount(res.count ?? (res.items ? res.items.length : 0));
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Failed to load projects");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [stationId, customerId, assignedToId, stageId, isCompleted, vipOnly, q, ordering, page, pageSize]);

  const customerById = useMemo(() => {
    const map = new Map<number, any>();
    for (const c of customers as any[]) {
      if (c?.id != null) map.set(Number(c.id), c);
    }
    return map;
  }, [customers]);

  function clearAll() {
    setStationId("");
    setCustomerId("");
    setAssignedToId("");
    setStageId("");
    setIsCompleted("");
    setVipOnly(false);
    setQ("");
    setOrdering("");
    setPage(1);
    setPageSize(25);
    setSearchParams({}, { replace: true });
    setActivePresetLabel(null);
  }

  function applyResolvedParams(label: string, resolved: PresetParams) {
    // Presets should set filters and reset to page 1, keep page size as-is
    const next = new URLSearchParams();

    if (resolved.station) next.set("station", resolved.station);
    if (resolved.customer) next.set("customer", resolved.customer);
    if (resolved.assigned_to) next.set("assigned_to", resolved.assigned_to);
    if (resolved.current_stage) next.set("current_stage", resolved.current_stage);
    if (resolved.is_completed) next.set("is_completed", resolved.is_completed);
    if (resolved.vip) next.set("vip", resolved.vip);

    // Keep search/sort empty when applying a preset (clean mental model)
    // (If you want presets to store q/ordering later, we can add it.)
    next.set("page", "1");
    next.set("page_size", String(pageSize));

    setSearchParams(next, { replace: true });
    setActivePresetLabel(label);
  }

  async function applyBuiltinPreset(preset: BuiltinPreset) {
    if (preset.key === "all") {
      clearAll();
      return;
    }

    if (preset.key === "vip_customers") {
      applyResolvedParams(preset.label, { vip: "1" });
      return;
    }

    if (preset.key === "in_progress") {
      applyResolvedParams(preset.label, { is_completed: "false" });
      return;
    }

    if (preset.key === "completed") {
      applyResolvedParams(preset.label, { is_completed: "true" });
      return;
    }

    if (preset.key === "assigned_to_me") {
      try {
        const me = await getMyEmployee();
        if (!me?.id) {
          setActivePresetLabel("Assigned to Me (no employee record)");
          return;
        }
        applyResolvedParams(preset.label, { assigned_to: String(me.id) });
      } catch {
        setActivePresetLabel("Assigned to Me (failed to load)");
      }
    }
  }

  function applySavedPreset(preset: SavedPreset) {
    applyResolvedParams(preset.label, preset.params || {});
  }

  function openSavePresetModal() {
    // save only core filters (not q/order/page)
    const coreHasAnything = !!stationId || !!customerId || !!assignedToId || !!stageId || !!isCompleted || vipOnly;
    if (!coreHasAnything) return;

    setPresetName("My preset");
    setPresetNameErr(null);
    setShowSaveModal(true);
  }

  function confirmSavePreset() {
    const label = presetName.trim();
    if (!label) {
      setPresetNameErr("Please enter a name.");
      return;
    }

    const exists = savedPresets.some((p) => normalize(p.label) === normalize(label));
    if (exists) {
      setPresetNameErr("A preset with that name already exists.");
      return;
    }

    const coreHasAnything = !!stationId || !!customerId || !!assignedToId || !!stageId || !!isCompleted || vipOnly;
    if (!coreHasAnything) {
      setPresetNameErr("Select at least one filter to save.");
      return;
    }

    const newPreset: SavedPreset = {
      key: `saved-${Date.now()}`,
      label,
      params: {
        station: stationId || undefined,
        customer: customerId || undefined,
        assigned_to: assignedToId || undefined,
        current_stage: stageId || undefined,
        vip: vipOnly ? "1" : undefined,
        is_completed: isCompleted || undefined,
      },
    };

    const next = [newPreset, ...savedPresets].slice(0, 20);
    setSavedPresets(next);
    persistSavedPresets(next);

    setActivePresetLabel(label);
    setShowSaveModal(false);
  }

  function deleteSavedPreset(key: string) {
    const next = savedPresets.filter((p) => p.key !== key);
    setSavedPresets(next);
    persistSavedPresets(next);

    if (activePresetLabel && !next.some((p) => p.label === activePresetLabel)) {
      setActivePresetLabel(null);
    }
  }

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
    setOrdering((cur) => toggleOrdering(cur, sortFields[field]));
    setPage(1);
    setActivePresetLabel(null);
  }

  // Pagination helpers
  function goToPage(nextPage: number) {
    const target = Math.max(1, Math.min(pageCount, nextPage));
    setPage(target);
  }

  return (
    <>
      <h3 className="mb-3">Makerfex Projects</h3>

      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-2">
        <div className="text-muted">
          {loading ? "Loading…" : `${items.length} shown • ${count} total`}
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-secondary" size="sm">
              Presets
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ minWidth: 280 }}>
              {savedPresets.length > 0 && (
                <>
                  <Dropdown.Header>Saved</Dropdown.Header>
                  {savedPresets.map((p) => (
                    <Dropdown.Item
                      key={p.key}
                      onClick={() => applySavedPreset(p)}
                      style={{ paddingLeft: "1.25rem" }}
                    >
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <span>{p.label}</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-danger"
                          title="Delete preset"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteSavedPreset(p.key);
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                </>
              )}

              <Dropdown.Header>Built-in</Dropdown.Header>
              {BUILTIN_PRESETS.map((p) => (
                <Dropdown.Item
                  key={p.key}
                  onClick={() => applyBuiltinPreset(p)}
                  style={{ paddingLeft: "1.25rem" }}
                >
                  {p.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Button size="sm" variant="outline-primary" onClick={openSavePresetModal}>
            Save preset
          </Button>

          <Button size="sm" variant="outline-secondary" onClick={clearAll} disabled={!hasAnyFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      {/* Search + filters row */}
      <div className="d-flex gap-2 flex-wrap mb-2 align-items-center">
        {/* Free text search */}
        <Form.Control
          size="sm"
          style={{ width: 260 }}
          placeholder="Search projects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {/* Station */}
        <Form.Select
          size="sm"
          style={{ width: 200 }}
          value={stationId}
          onChange={(e) => {
            setStationId(e.target.value);
            setPage(1);
            setActivePresetLabel(null);
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
            setPage(1);
            setActivePresetLabel(null);
          }}
        >
          <option value="">All stages</option>
          {stages.map((st: any) => (
            <option key={st.id} value={String(st.id)}>
              {stageLabel(st)}
            </option>
          ))}
        </Form.Select>

        {/* State (completedness) */}
        <Form.Select
          size="sm"
          style={{ width: 160 }}
          value={isCompleted}
          onChange={(e) => {
            const v = e.target.value as "" | "true" | "false";
            setIsCompleted(v);
            setPage(1);
            setActivePresetLabel(null);
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
            setPage(1);
            setActivePresetLabel(null);
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
            setPage(1);
            setActivePresetLabel(null);
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
            setPage(1);
            setActivePresetLabel(null);
          }}
        />

        {/* Page size */}
        <Form.Select
          size="sm"
          style={{ width: 140 }}
          value={String(pageSize)}
          onChange={(e) => {
            setPageSize(parsePageSize(e.target.value));
            setPage(1);
            setActivePresetLabel(null);
          }}
          title="Rows per page"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Form.Select>
      </div>

      {activePresetLabel && (
        <div className="text-muted mb-3">
          Preset applied: <strong>{activePresetLabel}</strong>
        </div>
      )}

      {/* Save preset modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Save preset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Preset name</Form.Label>
          <Form.Control
            value={presetName}
            onChange={(e) => {
              setPresetName(e.target.value);
              if (presetNameErr) setPresetNameErr(null);
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmSavePreset();
              }
            }}
          />
          {presetNameErr && <div className="text-danger mt-2">{presetNameErr}</div>}
          <div className="text-muted mt-3">
            Saves your current filters (Station / Stage / State / Customer / Assigned / VIP) on this device.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmSavePreset}>
            Save preset
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Results */}
      {loading && (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading projects…</span>
        </div>
      )}

      {err && <div className="text-danger">{err}</div>}

      {!loading && !err && (
        <>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("name")}>
                    Name {orderingIcon(ordering, sortFields.name)}
                  </Button>
                </th>

                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("stage")}>
                    Stage {orderingIcon(ordering, sortFields.stage)}
                  </Button>
                </th>

                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("priority")}>
                    Priority {orderingIcon(ordering, sortFields.priority)}
                  </Button>
                </th>

                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("due")}>
                    Due {orderingIcon(ordering, sortFields.due)}
                  </Button>
                </th>

                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("station")}>
                    Station {orderingIcon(ordering, sortFields.station)}
                  </Button>
                </th>

                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("customer")}>
                    Customer {orderingIcon(ordering, sortFields.customer)}
                  </Button>
                </th>

                <th>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => onSort("assigned")}>
                    Assigned {orderingIcon(ordering, sortFields.assigned)}
                  </Button>
                </th>

                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => {
                const c = p.customer ? customerById.get(Number(p.customer)) : null;
                const isVip = c ? customerIsVip(c) : false;

                const stageName = (p as any).current_stage_name ?? "—";
                const stageIsCompleted = Boolean((p as any).is_completed);
                const canLogSale = Boolean((p as any).can_log_sale);

                return (
                  <tr key={p.id}>
                    {/* Name (photo inline, bold name) */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.photo_url ? (
                          <img
                            src={p.photo_url}
                            alt=""
                            style={{
                              width: 34,
                              height: 34,
                              objectFit: "cover",
                              borderRadius: 8,
                              flex: "0 0 auto",
                            }}
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

              {items.length === 0 && (
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
              Page <strong>{page}</strong> of <strong>{pageCount}</strong>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                ← Prev
              </Button>

              <Button
                size="sm"
                variant="outline-secondary"
                disabled={page >= pageCount}
                onClick={() => goToPage(page + 1)}
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

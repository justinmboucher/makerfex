// src/pages/makerfex/Projects.tsx
// ============================================================================
// Makerfex Projects Page (Vyzor Shell)
// ----------------------------------------------------------------------------
// Read-only Projects list with URL-persisted filters + presets.
//
// Backend filters:
// - ?station=
// - ?customer=
// - ?assigned_to=
// - ?current_stage=
// - ?is_completed=true|false  (NEW; stage-truth completion)
//
// Frontend-only filter (persisted in URL for shareability):
// - ?vip=1 (filters projects to VIP customers client-side)
//
// Presets:
// - Built-in:
//   • Assigned to Me (uses /api/accounts/employees/me/ and caches employee)
//   • VIP Customers (vip=1)
//   • In Progress (is_completed=false)
//   • Completed (is_completed=true)
// - User-saved presets store CURRENT filter IDs + vip + is_completed (localStorage)
//
// UI:
// - Shows “Preset applied: …” line under filters when a preset was applied
// - Clears that line when user changes filters manually or clears filters
// - Save preset uses a React-Bootstrap Modal
// - Shows VIP pill next to customer name for VIP customers only
// - Stage is primary indicator; status is secondary
// - Uses Bootstrap Icons for actions (log sale + view)
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

/** Unwraps either {items}, {results}, an array, or returns [] */
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
  key: string; // unique
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

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [stations, setStations] = useState<Station[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);

  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() => loadSavedPresets());

  const [searchParams, setSearchParams] = useSearchParams();

  // Keep as strings for simple URL sync
  const [stationId, setStationId] = useState(() => cleanIdParam(searchParams.get("station")));
  const [customerId, setCustomerId] = useState(() => cleanIdParam(searchParams.get("customer")));
  const [assignedToId, setAssignedToId] = useState(() => cleanIdParam(searchParams.get("assigned_to")));
  const [stageId, setStageId] = useState(() => cleanIdParam(searchParams.get("current_stage")));

  // Backend completion filter (stage-truth)
  const [isCompleted, setIsCompleted] = useState<"" | "true" | "false">(() => {
    const v = searchParams.get("is_completed");
    return v === "true" || v === "false" ? v : "";
  });

  // Frontend-only filter (VIP)
  const [vipOnly, setVipOnly] = useState(() => searchParams.get("vip") === "1");

  // UX: tiny line under filters
  const [activePresetLabel, setActivePresetLabel] = useState<string | null>(null);

  // Save preset modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetNameErr, setPresetNameErr] = useState<string | null>(null);

  const navigate = useNavigate();

  // Prevent initial URL sync effect from overwriting initial state
  const didInitFromUrl = useRef(false);

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

  const customerIsVip = (c: any): boolean => {
    return !!(c?.is_vip ?? c?.vip ?? c?.isVIP ?? false);
  };

  const hasAnyFilters =
    !!stationId || !!customerId || !!assignedToId || !!stageId || vipOnly || !!isCompleted;

  function buildSuggestedPresetName() {
    const parts: string[] = [];

    if (isCompleted === "true") parts.push("Completed");
    if (isCompleted === "false") parts.push("In Progress");
    if (vipOnly) parts.push("VIP");

    if (stationId) {
      const s = (stations as any[]).find((x) => String(x.id) === String(stationId));
      parts.push(s ? stationLabel(s) : `Station ${stationId}`);
    }

    if (stageId) {
      const st = (stages as any[]).find((x) => String(x.id) === String(stageId));
      parts.push(st ? stageLabel(st) : `Stage ${stageId}`);
    }

    if (customerId) {
      const c: any = (customers as any[]).find((x) => String(x.id) === String(customerId));
      parts.push(c ? customerLabel(c) : `Customer ${customerId}`);
    }

    if (assignedToId) {
      const e: any = (employees as any[]).find((x) => String(x.id) === String(assignedToId));
      parts.push(e ? employeeLabel(e) : `Employee ${assignedToId}`);
    }

    return parts.length ? parts.join(" • ") : "My preset";
  }

  // Read URL -> State (back/forward support)
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

    if (nextStation !== stationId) setStationId(nextStation);
    if (nextCustomer !== customerId) setCustomerId(nextCustomer);
    if (nextAssigned !== assignedToId) setAssignedToId(nextAssigned);
    if (nextStage !== stageId) setStageId(nextStage);
    if (nextVip !== vipOnly) setVipOnly(nextVip);
    if (nextIsCompleted !== isCompleted) setIsCompleted(nextIsCompleted);

    didInitFromUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load filter option lists once (non-fatal if any fail)
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

  // Push State -> URL (bookmark/share support)
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
    setOrDelete("vip", vipOnly ? "1" : "");
    setOrDelete("is_completed", isCompleted);

    const currentStr = searchParams.toString();
    const nextStr = next.toString();

    if (currentStr !== nextStr) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, customerId, assignedToId, stageId, vipOnly, isCompleted]);

  // Fetch projects whenever backend filters change
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const params: Record<string, any> = {};
        if (stationId) params.station = Number(stationId);
        if (customerId) params.customer = Number(customerId);
        if (assignedToId) params.assigned_to = Number(assignedToId);
        if (stageId) params.current_stage = Number(stageId);
        if (isCompleted) params.is_completed = isCompleted;

        const { items } = await listProjects(params);

        if (!alive) return;
        setItems(items as Project[]);
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
  }, [stationId, customerId, assignedToId, stageId, isCompleted]);

  // Customer lookup for VIP pill and VIP-only filter
  const customerById = useMemo(() => {
    const map = new Map<number, any>();
    for (const c of customers as any[]) {
      if (c?.id != null) map.set(Number(c.id), c);
    }
    return map;
  }, [customers]);

  const rows = useMemo(() => {
    if (!vipOnly) return items;

    return items.filter((p) => {
      if (!p.customer) return false;
      const c = customerById.get(Number(p.customer));
      return c ? customerIsVip(c) : false;
    });
  }, [items, vipOnly, customerById]);

  function clearFilters() {
    setStationId("");
    setCustomerId("");
    setAssignedToId("");
    setStageId("");
    setIsCompleted("");
    setVipOnly(false);

    setSearchParams({}, { replace: true });
    setActivePresetLabel(null);
  }

  function applyResolvedParams(label: string, resolved: PresetParams) {
    const next = new URLSearchParams();

    if (resolved.station) next.set("station", resolved.station);
    if (resolved.customer) next.set("customer", resolved.customer);
    if (resolved.assigned_to) next.set("assigned_to", resolved.assigned_to);
    if (resolved.current_stage) next.set("current_stage", resolved.current_stage);
    if (resolved.vip) next.set("vip", resolved.vip);
    if (resolved.is_completed) next.set("is_completed", resolved.is_completed);

    setSearchParams(next, { replace: true });
    setActivePresetLabel(label);
  }

  async function applyBuiltinPreset(preset: BuiltinPreset) {
    if (preset.key === "all") {
      clearFilters();
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
        const me = await getMyEmployee(); // fetch + cache
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
    if (!hasAnyFilters) return;
    setPresetName(buildSuggestedPresetName());
    setPresetNameErr(null);
    setShowSaveModal(true);
  }

  function closeSavePresetModal() {
    setShowSaveModal(false);
    setPresetNameErr(null);
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

    if (!hasAnyFilters) {
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

  return (
    <>
      <h3 className="mb-3">Makerfex Projects</h3>

      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-2">
        <div className="text-muted">{rows.length} loaded</div>

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
                    <Dropdown.Item key={p.key} onClick={() => applySavedPreset(p)}>
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
                <Dropdown.Item key={p.key} onClick={() => applyBuiltinPreset(p)}>
                  {p.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Button
            size="sm"
            variant="outline-primary"
            disabled={!hasAnyFilters}
            onClick={openSavePresetModal}
          >
            Save preset
          </Button>

          <Button size="sm" variant="outline-secondary" onClick={clearFilters} disabled={!hasAnyFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 flex-wrap mb-2">
        {/* Station */}
        <Form.Select
          size="sm"
          style={{ width: 220 }}
          value={stationId}
          onChange={(e) => {
            setStationId(e.target.value);
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
          style={{ width: 220 }}
          value={stageId}
          onChange={(e) => {
            setStageId(e.target.value);
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

        {/* Customer */}
        <Form.Select
          size="sm"
          style={{ width: 240 }}
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
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
          style={{ width: 240 }}
          value={assignedToId}
          onChange={(e) => {
            setAssignedToId(e.target.value);
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
            setActivePresetLabel(null);
          }}
        />
      </div>

      {activePresetLabel && (
        <div className="text-muted mb-3">
          Preset applied: <strong>{activePresetLabel}</strong>
        </div>
      )}

      {/* Save Preset Modal */}
      <Modal show={showSaveModal} onHide={closeSavePresetModal} centered>
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
            placeholder="e.g., VIP • Finishing • Jordan"
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
            This saves your current filters (Station / Stage / State / Customer / Assigned To / VIP) on this
            device.
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeSavePresetModal}>
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
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th style={{ width: 72 }}>Photo</th>
              <th>Name</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Due</th>
              <th>Station</th>
              <th>Customer</th>
              <th>Assigned</th>
              <th style={{ width: 96 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((p) => {
              const c = p.customer ? customerById.get(Number(p.customer)) : null;
              const isVip = c ? customerIsVip(c) : false;

              const stageName = (p as any).current_stage_name ?? "—";
              const stageIsCompleted = Boolean((p as any).is_completed);
              const canLogSale = Boolean((p as any).can_log_sale);

              return (
                <tr key={p.id}>
                  <td>
                      {p.photo_url ? (
                        <img
                          src={p.photo_url}
                          alt=""
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            background: "rgba(0,0,0,0.06)",
                          }}
                        />
                      )}
                    </td>

                  <td>
                    <div className="fw-semibold">
                      <Link to={`/projects/${p.id}`}>{p.name}</Link>
                    </div>
                    {p.reference_code ? <div className="text-muted">Ref: {p.reference_code}</div> : null}
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
                      <Link to={`/stations/${p.station}`}>
                        {p.station_name ?? `Station #${p.station}`}
                      </Link>
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
                        onClick={() => {
                          alert("Log Sale is not implemented yet. (Gate is working ✅)");
                        }}
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

            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-muted">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
}

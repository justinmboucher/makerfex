// src/pages/makerfex/Projects.tsx
// ============================================================================
// Makerfex Projects Page (Vyzor Shell)
// ----------------------------------------------------------------------------
// Read-only Projects list with URL-persisted filters + presets:
//
// Backend filters:
// - ?station=
// - ?customer=
// - ?assigned_to=
// - ?current_stage=   (NEW)
//
// Frontend-only filter (persisted in URL for shareability):
// - ?vip=1 (filters projects to VIP customers client-side)
//
// Presets:
// - Built-in:
//   • Assigned to Me (uses /api/accounts/employees/me/ and caches employee)
//   • VIP Customers (vip=1)
// - User-saved presets store CURRENT filter IDs + vip flag (localStorage)
//
// UI:
// - Shows “Preset applied: …” line under filters when a preset was applied
// - Clears that line when user changes filters manually or clears filters
// - Save preset uses a React-Bootstrap Modal
// - Shows VIP pill next to customer name for VIP customers only
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

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

function statusVariant(status: Project["status"]) {
  switch (status) {
    case "active":
      return "success";
    case "on_hold":
      return "warning";
    case "completed":
      return "secondary";
    case "cancelled":
      return "danger";
    default:
      return "light";
  }
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
  key: "all" | "assigned_to_me" | "vip_customers";
  label: string;
};

type PresetParams = {
  station?: string;
  customer?: string;
  assigned_to?: string;
  current_stage?: string;
  vip?: "1";
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

  const hasAnyFilters = !!stationId || !!customerId || !!assignedToId || !!stageId || vipOnly;

  function buildSuggestedPresetName() {
    const parts: string[] = [];

    if (vipOnly) parts.push("VIP");

    if (stationId) {
      const s = stations.find((x: any) => String(x.id) === String(stationId));
      parts.push(s ? stationLabel(s) : `Station ${stationId}`);
    }

    if (stageId) {
      const st = stages.find((x: any) => String(x.id) === String(stageId));
      parts.push(st ? stageLabel(st) : `Stage ${stageId}`);
    }

    if (customerId) {
      const c: any = customers.find((x: any) => String(x.id) === String(customerId));
      parts.push(c ? customerLabel(c) : `Customer ${customerId}`);
    }

    if (assignedToId) {
      const e: any = employees.find((x: any) => String(x.id) === String(assignedToId));
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

    if (nextStation !== stationId) setStationId(nextStation);
    if (nextCustomer !== customerId) setCustomerId(nextCustomer);
    if (nextAssigned !== assignedToId) setAssignedToId(nextAssigned);
    if (nextStage !== stageId) setStageId(nextStage);
    if (nextVip !== vipOnly) setVipOnly(nextVip);

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

    const currentStr = searchParams.toString();
    const nextStr = next.toString();

    if (currentStr !== nextStr) {
      setSearchParams(next, { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, customerId, assignedToId, stageId, vipOnly]);

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
  }, [stationId, customerId, assignedToId, stageId]);

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
    <div>
      <h3 className="mb-1">Makerfex Projects</h3>

      <div className="mb-3 text-muted">{rows.length} loaded</div>

      <div className="d-flex flex-wrap gap-2 align-items-end mb-2">
        {/* Station */}
        <div style={{ minWidth: 220 }}>
          <Form.Label className="mb-1">Station</Form.Label>
          <Form.Select
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
        </div>

        {/* Stage */}
        <div style={{ minWidth: 220 }}>
          <Form.Label className="mb-1">Stage</Form.Label>
          <Form.Select
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
        </div>

        {/* Customer */}
        <div style={{ minWidth: 220 }}>
          <Form.Label className="mb-1">Customer</Form.Label>
          <Form.Select
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
        </div>

        {/* Assigned */}
        <div style={{ minWidth: 220 }}>
          <Form.Label className="mb-1">Assigned To</Form.Label>
          <Form.Select
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
        </div>

        {/* VIP */}
        <div className="d-flex flex-column" style={{ minWidth: 120 }}>
          <Form.Label className="mb-1">VIP</Form.Label>
          <Form.Check
            type="checkbox"
            label="VIP only"
            checked={vipOnly}
            onChange={(e) => {
              setVipOnly(e.target.checked);
              setActivePresetLabel(null);
            }}
          />
        </div>

        {/* Presets */}
        <div className="ms-auto d-flex flex-wrap gap-2 align-items-end">
          <Dropdown>
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
                      className="d-flex align-items-center gap-2"
                      onClick={() => applySavedPreset(p)}
                    >
                      <span style={{ flex: 1 }}>{p.label}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteSavedPreset(p.key);
                        }}
                        title="Delete preset"
                      >
                        ✕
                      </Button>
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

          <Button variant="outline-primary" size="sm" disabled={!hasAnyFilters} onClick={openSavePresetModal}>
            Save preset
          </Button>

          <Button variant="outline-secondary" size="sm" disabled={!hasAnyFilters} onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      {activePresetLabel && (
        <div className="mb-3 text-muted">
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
          <div className="text-muted mt-3" style={{ fontSize: 13 }}>
            This saves your current filters (Station / Stage / Customer / Assigned To / VIP) on this device.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeSavePresetModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmSavePreset}>
            Save preset
          </Button>
        </Modal.Footer>
      </Modal>

      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted mt-3">
          <Spinner animation="border" size="sm" />
          Loading projects…
        </div>
      )}

      {err && <div className="text-danger mt-3">{err}</div>}

      {!loading && !err && (
        <div className="mt-3">
          <Table hover responsive>
            <thead>
              <tr>
                <th style={{ width: 72 }}>Photo</th>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Station</th>
                <th>Customer</th>
                <th>Assigned</th>
                <th style={{ width: 92 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const c = p.customer ? customerById.get(Number(p.customer)) : null;
                const isVip = c ? customerIsVip(c) : false;

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
                      <div className="d-flex flex-column">
                        <Link to={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                          {p.name}
                        </Link>
                        {p.reference_code ? (
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {p.reference_code}
                          </div>
                        ) : null}
                      </div>
                    </td>

                    <td>
                      <Badge bg={statusVariant(p.status)}>{p.status}</Badge>
                    </td>

                    <td>
                      <Badge bg={priorityVariant(p.priority)}>{p.priority}</Badge>
                    </td>

                    <td>{formatDate(p.due_date)}</td>

                    <td>{(p as any).station_name ?? "—"}</td>

                    <td>
                      {p.customer ? (
                        <div className="d-flex align-items-center gap-2">
                          <Link to={`/customers/${p.customer}`} style={{ textDecoration: "none" }}>
                            {p.customer_name ?? `Customer #${p.customer}`}
                          </Link>
                          {isVip ? (
                            <Badge bg="warning" text="dark">
                              VIP
                            </Badge>
                          ) : null}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      {p.assigned_to ? (
                        <span>{p.assigned_to_name ?? `Employee #${p.assigned_to}`}</span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" onClick={() => navigate(`/projects/${p.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
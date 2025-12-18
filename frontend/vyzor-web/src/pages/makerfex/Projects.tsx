// src/pages/makerfex/Projects.tsx
// ============================================================================
// Makerfex Projects Page (Vyzor Shell)
// ----------------------------------------------------------------------------
// Read-only Projects list with URL-persisted filters + presets:
//
// Backend filters:
//   - ?station=<id>
//   - ?customer=<id>
//   - ?assigned_to=<employee_id>
//
// Frontend-only filter (persisted in URL for shareability):
//   - ?vip=1   (filters projects to VIP customers client-side)
//
// Presets:
//   - Built-in:
//       • Assigned to Me (uses /api/accounts/employees/me/ and caches employee)
//       • VIP Customers  (vip=1)
//   - User-saved presets store CURRENT filter IDs + vip flag (localStorage)
//
// UI:
// - Shows “Preset applied: …” line under filters when a preset was applied
// - Clears that line when user changes filters manually or clears filters
// - Save preset uses a React-Bootstrap Modal
// - Shows VIP pill next to customer name for VIP customers only
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { Table, Spinner, Badge, Button, Form, Dropdown, Modal } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { listProjects } from "../../api/projects";
import type { Project } from "../../api/projects";

import { listStations, type Station } from "../../api/stations";
import { listEmployees, type Employee, getMyEmployee } from "../../api/employees";
import { listCustomers, type Customer } from "../../api/customers";

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

type SavedPreset = {
  key: string; // unique
  label: string;
  params: {
    station?: string;
    customer?: string;
    assigned_to?: string;
    vip?: "1";
  };
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

  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() => loadSavedPresets());

  const [searchParams, setSearchParams] = useSearchParams();

  // Keep as strings for <select>
  const [stationId, setStationId] = useState<string>(() => cleanIdParam(searchParams.get("station")));
  const [customerId, setCustomerId] = useState<string>(() => cleanIdParam(searchParams.get("customer")));
  const [assignedToId, setAssignedToId] = useState<string>(() => cleanIdParam(searchParams.get("assigned_to")));

  // Frontend-only filter (VIP)
  const [vipOnly, setVipOnly] = useState<boolean>(() => searchParams.get("vip") === "1");

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

  const customerIsVip = (c: any): boolean => {
    return !!(c?.is_vip ?? c?.vip ?? c?.isVIP ?? false);
  };

  const hasAnyFilters = !!stationId || !!customerId || !!assignedToId || vipOnly;

  function buildSuggestedPresetName() {
    const parts: string[] = [];

    if (vipOnly) parts.push("VIP");
    if (stationId) {
      const s = stations.find((x: any) => String(x.id) === String(stationId));
      parts.push(s ? stationLabel(s) : `Station ${stationId}`);
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
    const nextVip = searchParams.get("vip") === "1";

    if (nextStation !== stationId) setStationId(nextStation);
    if (nextCustomer !== customerId) setCustomerId(nextCustomer);
    if (nextAssigned !== assignedToId) setAssignedToId(nextAssigned);
    if (nextVip !== vipOnly) setVipOnly(nextVip);

    didInitFromUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load filter option lists once (non-fatal if any fail)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [stationsRes, employeesRes, customersRes] = await Promise.all([
          listStations(),
          listEmployees({ with_counts: 0 } as any),
          listCustomers(),
        ]);

        if (!alive) return;

        setStations(unwrapItems<Station>(stationsRes));
        setEmployees(unwrapItems<Employee>(employeesRes));
        setCustomers(unwrapItems<Customer>(customersRes));
      } catch {
        if (!alive) return;
        setStations([]);
        setEmployees([]);
        setCustomers([]);
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
    setOrDelete("vip", vipOnly ? "1" : "");

    const currentStr = searchParams.toString();
    const nextStr = next.toString();

    if (currentStr !== nextStr) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, customerId, assignedToId, vipOnly]);

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

        const { items } = await listProjects(params);

        if (!alive) return;
        setItems(items);
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
  }, [stationId, customerId, assignedToId]);

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
    setVipOnly(false);
    setSearchParams({}, { replace: true });
    setActivePresetLabel(null);
  }

  function applyResolvedParams(
    label: string,
    resolved: { station?: string; customer?: string; assigned_to?: string; vip?: "1" }
  ) {
    const next = new URLSearchParams();
    if (resolved.station) next.set("station", resolved.station);
    if (resolved.customer) next.set("customer", resolved.customer);
    if (resolved.assigned_to) next.set("assigned_to", resolved.assigned_to);
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
        const me = await getMyEmployee(); // ✅ fetch + cache
        if (!me?.id) {
          setActivePresetLabel("Assigned to Me (no employee record)");
          return;
        }
        applyResolvedParams(preset.label, { assigned_to: String(me.id) });
      } catch (e) {
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

    if (!stationId && !customerId && !assignedToId && !vipOnly) {
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
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Makerfex Projects</h3>
          <div style={{ opacity: 0.7, marginTop: 4 }}>{rows.length} loaded</div>
        </div>

        <div style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
          <Form.Group style={{ minWidth: 220 }} controlId="projectsStationFilter">
            <Form.Label style={{ marginBottom: 4 }}>Station</Form.Label>
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
          </Form.Group>

          <Form.Group style={{ minWidth: 220 }} controlId="projectsCustomerFilter">
            <Form.Label style={{ marginBottom: 4 }}>Customer</Form.Label>
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
          </Form.Group>

          <Form.Group style={{ minWidth: 220 }} controlId="projectsAssignedFilter">
            <Form.Label style={{ marginBottom: 4 }}>Assigned To</Form.Label>
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
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ marginBottom: 4 }}>VIP</Form.Label>
            <Form.Check
              type="switch"
              id="projectsVipSwitch"
              label="VIP only"
              checked={vipOnly}
              onChange={(e) => {
                setVipOnly(e.target.checked);
                setActivePresetLabel(null);
              }}
            />
          </Form.Group>

          <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary">Presets</Dropdown.Toggle>
              <Dropdown.Menu style={{ minWidth: 300 }}>
                {savedPresets.length > 0 && (
                  <>
                    <Dropdown.Header>Saved</Dropdown.Header>
                    {savedPresets.map((p) => (
                      <div
                        key={p.key}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                      >
                        <Dropdown.Item onClick={() => applySavedPreset(p)} style={{ flex: 1 }}>
                          {p.label}
                        </Dropdown.Item>
                        <Button
                          size="sm"
                          variant="link"
                          style={{ textDecoration: "none", paddingRight: 10 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteSavedPreset(p.key);
                          }}
                          title="Delete preset"
                        >
                          ✕
                        </Button>
                      </div>
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

            <Form.Group>
              <Form.Label style={{ marginBottom: 4 }}>&nbsp;</Form.Label>
              <Button
                variant="outline-secondary"
                onClick={openSavePresetModal}
                disabled={!hasAnyFilters}
                title={hasAnyFilters ? "Save current filters as a preset" : "Select filters first"}
              >
                Save preset
              </Button>
            </Form.Group>

            <Form.Group>
              <Form.Label style={{ marginBottom: 4 }}>&nbsp;</Form.Label>
              <Button variant="outline-secondary" onClick={clearFilters} disabled={!hasAnyFilters}>
                Clear filters
              </Button>
            </Form.Group>
          </div>
        </div>
      </div>

      {activePresetLabel && (
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.65 }}>
          Preset applied: <strong>{activePresetLabel}</strong>
        </div>
      )}

      {/* Save Preset Modal */}
      <Modal show={showSaveModal} onHide={closeSavePresetModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Save preset</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="savePresetName">
            <Form.Label>Preset name</Form.Label>
            <Form.Control
              type="text"
              value={presetName}
              onChange={(e) => {
                setPresetName(e.target.value);
                if (presetNameErr) setPresetNameErr(null);
              }}
              placeholder="e.g., VIP • Acme • Jordan"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmSavePreset();
                }
              }}
            />
            {presetNameErr && <div style={{ marginTop: 6, fontSize: 12, color: "crimson" }}>{presetNameErr}</div>}
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
              This saves your current filters (Station / Customer / Assigned To / VIP) on this device.
            </div>
          </Form.Group>
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

      {loading && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner animation="border" size="sm" />
          <span>Loading projects…</span>
        </div>
      )}

      {err && <div style={{ marginTop: 16, color: "crimson" }}>{err}</div>}

      {!loading && !err && (
        <div style={{ marginTop: 16 }}>
          <Table responsive hover>
            <thead>
              <tr>
                <th style={{ width: 56 }}>Photo</th>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Customer</th>
                <th>Assigned</th>
                <th style={{ width: 120 }}></th>
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
                          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(0,0,0,0.08)" }} />
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.reference_code ? <div style={{ fontSize: 12, opacity: 0.7 }}>{p.reference_code}</div> : null}
                    </td>

                    <td>
                      <Badge bg={statusVariant(p.status)}>{p.status}</Badge>
                    </td>

                    <td>
                      <Badge bg={priorityVariant(p.priority)}>{p.priority}</Badge>
                    </td>

                    <td>{formatDate(p.due_date)}</td>

                    <td>
                      {p.customer ? (
                        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                          <Link to={`/customers/${p.customer}`}>{p.customer_name ?? `Customer #${p.customer}`}</Link>
                          {isVip ? (
                            <Badge bg="warning" text="dark">
                              VIP
                            </Badge>
                          ) : null}
                        </span>
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

                    <td style={{ textAlign: "right" }}>
                      <Button size="sm" variant="outline-primary" onClick={() => navigate(`/projects/${p.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", opacity: 0.7, padding: 24 }}>
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

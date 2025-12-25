// src/components/makerfex/LogSaleModal.tsx
// ============================================================================
// LogSaleModal
// ----------------------------------------------------------------------------
// Reusable modal for logging a sale from a project.
// - Uses backend endpoint: POST /sales/orders/log_from_project/
// - Keeps client logic minimal; backend remains authoritative.
// - On success: returns the created SalesOrder to caller.
// - Optional "suggested total" prefill hook-point (future ML / heuristics).
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

import { logSaleFromProject, type SalesOrder } from "../../api/sales";

export type SaleSource = "etsy" | "website" | "pos" | "other";

export type LogSaleModalForm = {
  total_amount: string;
  order_date: string; // YYYY-MM-DD
  notes: string;
  source: SaleSource;
  archive_project: boolean;
  create_product_template: boolean;
  new_template_name: string;
};

export type LogSaleModalProps = {
  show: boolean;
  onHide: () => void;

  projectId: number | null;
  projectName?: string | null;

  // Optional project metadata for best-effort prefills.
  // (Callers can pass the project object they already have; safe to omit.)
  project?: any;

  // Optional defaults (caller overrides)
  initial?: Partial<LogSaleModalForm>;

  // Called after successful creation
  onSuccess: (order: SalesOrder) => void;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function coercePositiveNumberString(v: any): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return typeof v === "string" ? v : String(n);
}

// Best-effort: if the backend ever starts providing these on Project serializers,
// we can prefill total_amount without changing callers.
// NOTE: This is *not* an ML model. It's a placeholder signal extractor.
function getSuggestedSaleTotalAmountFromProject(project: any): string | undefined {
  if (!project) return undefined;

  const candidates = [
    project?.total_amount,
    project?.sale_amount,
    project?.sale_total,
    project?.price,
    project?.quoted_price,
    project?.quote_total,
    project?.total_price,
  ];

  for (const v of candidates) {
    const s = coercePositiveNumberString(v);
    if (s) return s;
  }

  return undefined;
}

export default function LogSaleModal({
  show,
  onHide,
  projectId,
  projectName,
  project,
  initial,
  onSuccess,
}: LogSaleModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedTotal = useMemo(() => {
    // Caller wins: if they pass initial.total_amount, don't second-guess it.
    if (initial?.total_amount) return initial.total_amount;

    // Otherwise: best-effort from provided project object (if any)
    const fromProject = getSuggestedSaleTotalAmountFromProject(project);

    // Future hook-point:
    // TODO (sequence later): fetch ML suggestion from backend by projectId
    // and prefer it over fromProject. Keep editable.

    return fromProject;
  }, [initial?.total_amount, project]);

  const defaultForm: LogSaleModalForm = useMemo(
    () => ({
      total_amount: suggestedTotal ?? "",
      order_date: todayISO(),
      notes: "",
      source: "other",
      archive_project: true,
      create_product_template: false,
      new_template_name: "",
      ...(initial ?? {}),
    }),
    [initial, suggestedTotal]
  );

  const [form, setForm] = useState<LogSaleModalForm>(defaultForm);

  // Reset form when opening (so you don’t carry stale values between projects)
  useEffect(() => {
    if (show) {
      setError(null);
      setSubmitting(false);
      setForm(defaultForm);
    }
  }, [show, defaultForm]);

  function update<K extends keyof LogSaleModalForm>(key: K, value: LogSaleModalForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    if (!projectId) return;

    setSubmitting(true);
    setError(null);

    try {
      if (!form.total_amount) throw new Error("Sale total is required.");
      if (form.create_product_template && !form.new_template_name.trim()) {
        throw new Error("Template name is required when creating a product template.");
      }

      const order = await logSaleFromProject({
        project_id: projectId,
        total_amount: form.total_amount,
        order_date: form.order_date,
        notes: form.notes,
        source: form.source,
        archive_project: form.archive_project,
        create_product_template: form.create_product_template,
        new_template_name: form.new_template_name,
      });

      onHide();
      onSuccess(order);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to log sale.");
    } finally {
      setSubmitting(false);
    }
  }

  const title = projectName ? `Log Sale • ${projectName}` : "Log Sale";

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Total Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={form.total_amount}
              onChange={(e) => update("total_amount", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Order Date</Form.Label>
            <Form.Control
              type="date"
              value={form.order_date}
              onChange={(e) => update("order_date", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Source</Form.Label>
            <Form.Select
              value={form.source}
              onChange={(e) => update("source", e.target.value as any)}
            >
              <option value="other">Other</option>
              <option value="etsy">Etsy</option>
              <option value="website">Website</option>
              <option value="pos">POS</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </Form.Group>

          <Form.Check
            className="mb-2"
            label="Archive project after sale"
            checked={form.archive_project}
            onChange={(e) => update("archive_project", e.target.checked)}
          />

          <Form.Check
            className="mb-2"
            label="Save as new product template"
            checked={form.create_product_template}
            onChange={(e) => {
              const checked = e.target.checked;
              // Helpful default: if turning on and name is empty, seed from projectName
              if (checked && !form.new_template_name.trim() && projectName) {
                setForm((prev) => ({
                  ...prev,
                  create_product_template: true,
                  new_template_name: prev.new_template_name || projectName,
                }));
                return;
              }
              update("create_product_template", checked);
            }}
          />

          {form.create_product_template ? (
            <Form.Group className="mb-2">
              <Form.Label>New Template Name</Form.Label>
              <Form.Control
                value={form.new_template_name}
                onChange={(e) => update("new_template_name", e.target.value)}
              />
            </Form.Group>
          ) : null}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit} disabled={submitting || !projectId}>
          {submitting ? "Logging…" : "Log Sale"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

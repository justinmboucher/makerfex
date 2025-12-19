// src/components/tables/DataTableControls.tsx
// ============================================================================
// Generic controls row for server-driven tables.
// - Search input
// - Page size selector (10/25/50/100)
// - Optional presets dropdown
// - Optional Save Preset (modal) + Clear filters buttons
// No destructive actions: saving presets is local/UI-level; filtering remains backend-authoritative.
// ============================================================================

import { useMemo, useState } from "react";
import { Dropdown, Form, Modal, Button } from "react-bootstrap";
import type { TablePreset } from "./tablePresets";

const PAGE_SIZES = [10, 25, 50, 100] as const;

export type DataTableControlsProps<P extends Record<string, any> = Record<string, any>> = {
  // Search
  q: string;
  onQChange: (v: string) => void;
  searchPlaceholder?: string;

  // Page size
  pageSize: number;
  onPageSizeChange: (n: number) => void;

  // Label (e.g., "25 shown • 30 total")
  shownCountLabel: string;

  // Presets (optional)
  presets?: TablePreset<P>[];
  activePresetKey?: string;
  onPresetChange?: (key: string) => void;

  // Save / Clear (optional)
  onClearFilters?: () => void;
  onSavePreset?: (label: string) => void;

  // UI state helpers (optional)
  canClearFilters?: boolean; // default true
  canSavePreset?: boolean; // default true

  // Modal copy (optional)
  savePresetTitle?: string; // default "Save preset"
  savePresetLabel?: string; // default "Preset name"
};

function parsePageSize(v: string): number {
  const n = Number(v);
  return PAGE_SIZES.includes(n as any) ? n : 25;
}

export default function DataTableControls<P extends Record<string, any> = Record<string, any>>(
  props: DataTableControlsProps<P>
) {
  const {
    q,
    onQChange,
    searchPlaceholder = "Search…",
    pageSize,
    onPageSizeChange,
    shownCountLabel,
    presets,
    activePresetKey,
    onPresetChange,
    onClearFilters,
    onSavePreset,
    canClearFilters = true,
    canSavePreset = true,
    savePresetTitle = "Save preset",
    savePresetLabel = "Preset name",
  } = props;

  const activePresetLabel = useMemo(() => {
    if (!presets || !activePresetKey) return undefined;
    return presets.find((p) => p.key === activePresetKey)?.label;
  }, [presets, activePresetKey]);

  // Save preset modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetNameTouched, setPresetNameTouched] = useState(false);

  const nameError = useMemo(() => {
    const trimmed = presetName.trim();
    if (!presetNameTouched) return "";
    if (!trimmed) return "Please enter a preset name.";
    return "";
  }, [presetName, presetNameTouched]);

  function openSaveModal() {
    setPresetName("");
    setPresetNameTouched(false);
    setShowSaveModal(true);
  }

  function closeSaveModal() {
    setShowSaveModal(false);
  }

  function submitSavePreset() {
    setPresetNameTouched(true);
    const trimmed = presetName.trim();
    if (!trimmed) return;
    onSavePreset?.(trimmed);
    setShowSaveModal(false);
  }

  return (
    <>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        {/* Left cluster: presets + save/clear + search */}
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {presets && presets.length > 0 && onPresetChange && (
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                Presets{activePresetLabel ? `: ${activePresetLabel}` : ""}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {presets.map((p) => (
                  <Dropdown.Item
                    key={p.key}
                    active={p.key === activePresetKey}
                    onClick={() => onPresetChange(p.key)}
                  >
                    {p.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}

          {onSavePreset && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              disabled={!canSavePreset}
              onClick={openSaveModal}
            >
              Save preset
            </button>
          )}

          {onClearFilters && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={!canClearFilters}
              onClick={onClearFilters}
            >
              Clear filters
            </button>
          )}

          <Form.Control
            style={{ maxWidth: 320 }}
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => onQChange(e.target.value)}
          />
        </div>

        {/* Right cluster: page size + counts */}
        <div className="d-flex flex-wrap gap-2 align-items-center ms-auto">
          <Form.Select
            style={{ width: 140 }}
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(parsePageSize(e.target.value))}
            title="Rows per page"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </Form.Select>

          <div className="text-muted">{shownCountLabel}</div>
        </div>
      </div>

      {/* Save Preset Modal */}
      <Modal show={showSaveModal} onHide={closeSaveModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{savePresetTitle}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>{savePresetLabel}</Form.Label>
            <Form.Control
              autoFocus
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onBlur={() => setPresetNameTouched(true)}
              placeholder="e.g. VIP customers"
              isInvalid={!!nameError}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitSavePreset();
                }
              }}
            />
            {nameError ? <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback> : null}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeSaveModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitSavePreset} disabled={!canSavePreset}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// src/components/tables/DataTableControls.tsx
// ============================================================================
// Generic controls row for server-driven tables.
// - Search input (left)
// - Optional inline slot after search (for page-specific filter selects)
// - Right-side control cluster:
//   * Presets dropdown (Saved + Built-in sections)
//   * Save preset modal
//   * Clear filters
//   * Page size selector
//   * Counts label
// ============================================================================

import { useMemo, useState, type ReactNode } from "react";
import { Dropdown, Form, Modal, Button } from "react-bootstrap";
import type { TablePreset } from "./tablePresets";

const PAGE_SIZES = [10, 25, 50, 100] as const;

export type DataTableControlsProps<P extends Record<string, any> = Record<string, any>> = {
  // Search
  q: string;
  onQChange: (v: string) => void;
  searchPlaceholder?: string;

  // Optional slot rendered after search (page-specific filters)
  afterSearch?: ReactNode;

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

  // Delete presets (optional; intended for saved presets only)
  onDeletePreset?: (key: string) => void;
  canDeletePreset?: (key: string) => boolean;

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

function PresetRow({
  presetKey,
  label,
  isActive,
  onSelect,
  showDelete,
  onDelete,
}: {
  presetKey: string;
  label: string;
  isActive: boolean;
  onSelect: (key: string) => void;
  showDelete: boolean;
  onDelete?: (key: string) => void;
}) {
  return (
    <div className="d-flex align-items-center justify-content-between px-2">
      <Dropdown.Item className="flex-grow-1" active={isActive} onClick={() => onSelect(presetKey)}>
        {label}
      </Dropdown.Item>

      {showDelete ? (
        <button
          type="button"
          className="btn btn-link btn-sm text-danger ms-2"
          title="Delete preset"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.(presetKey);
          }}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

export default function DataTableControls<P extends Record<string, any> = Record<string, any>>(
  props: DataTableControlsProps<P>
) {
  const {
    q,
    onQChange,
    searchPlaceholder = "Search…",
    afterSearch,
    pageSize,
    onPageSizeChange,
    shownCountLabel,
    presets,
    activePresetKey,
    onPresetChange,
    onClearFilters,
    onSavePreset,
    onDeletePreset,
    canDeletePreset,
    canClearFilters = true,
    canSavePreset = true,
    savePresetTitle = "Save preset",
    savePresetLabel = "Preset name",
  } = props;

  const activePresetLabel = useMemo(() => {
    if (!presets || !activePresetKey) return undefined;
    return presets.find((p) => p.key === activePresetKey)?.label;
  }, [presets, activePresetKey]);

  const { savedPresets, builtinPresets } = useMemo(() => {
    const list = presets ?? [];
    const saved = list.filter((p) => !p.is_builtin);
    const builtin = list.filter((p) => !!p.is_builtin);
    return { savedPresets: saved, builtinPresets: builtin };
  }, [presets]);

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
        {/* Left: Search */}
        <Form.Control
          style={{ maxWidth: 320 }}
          placeholder={searchPlaceholder}
          value={q}
          onChange={(e) => onQChange(e.target.value)}
        />

        {/* Inline slot: page-specific filters */}
        {afterSearch ? (
          <div className="d-flex flex-wrap gap-2 align-items-center">{afterSearch}</div>
        ) : null}

        {/* Right: Presets + Save/Clear + PageSize + Counts */}
        <div className="d-flex flex-wrap gap-2 align-items-center ms-auto">
          {presets && presets.length > 0 && onPresetChange && (
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                Presets{activePresetLabel ? `: ${activePresetLabel}` : ""}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ minWidth: 280 }}>
                {/* Saved section */}
                {savedPresets.length > 0 && (
                  <>
                    <Dropdown.Header className="fw-bold">Saved</Dropdown.Header>
                    {savedPresets.map((p) => {
                      const deletable = !!onDeletePreset && !!canDeletePreset?.(p.key);
                      return (
                        <PresetRow
                          key={p.key}
                          presetKey={p.key}
                          label={p.label}
                          isActive={p.key === activePresetKey}
                          onSelect={onPresetChange}
                          showDelete={deletable}
                          onDelete={onDeletePreset}
                        />
                      );
                    })}
                    <Dropdown.Divider />
                  </>
                )}

                {/* Built-in section */}
                {builtinPresets.length > 0 && (
                  <>
                    <Dropdown.Header className="fw-bold">Built-in</Dropdown.Header>
                    {builtinPresets.map((p) => (
                      <PresetRow
                        key={p.key}
                        presetKey={p.key}
                        label={p.label}
                        isActive={p.key === activePresetKey}
                        onSelect={onPresetChange}
                        showDelete={false}
                      />
                    ))}
                  </>
                )}

                {/* Fallback */}
                {savedPresets.length === 0 && builtinPresets.length === 0 && (
                  <div className="px-3 py-2 text-muted">No presets</div>
                )}
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

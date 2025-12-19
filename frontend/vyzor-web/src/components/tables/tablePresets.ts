// src/components/tables/tablePresets.ts
// ============================================================================
// Reusable table preset infrastructure (no page-specific logic).
// Presets are param bundles for backend filtering/sorting.
// ============================================================================

export type TablePreset<P extends Record<string, any> = Record<string, any>> = {
  key: string;
  label: string;
  params: Partial<P>;
  is_builtin?: boolean;
};

function normalizeLabel(s: string) {
  return (s || "").trim().toLowerCase();
}

export function loadSavedPresets<P extends Record<string, any>>(storageKey: string): TablePreset<P>[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TablePreset<P>[];
  } catch {
    return [];
  }
}

export function savePresets<P extends Record<string, any>>(storageKey: string, presets: TablePreset<P>[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(presets));
  } catch {
    // ignore
  }
}

export function addSavedPreset<P extends Record<string, any>>(
  storageKey: string,
  existing: TablePreset<P>[],
  preset: Omit<TablePreset<P>, "is_builtin">,
  max = 20
): { next: TablePreset<P>[]; error?: string } {
  const label = preset.label?.trim();
  if (!label) return { next: existing, error: "Please enter a name." };

  const dup = existing.some((p) => normalizeLabel(p.label) === normalizeLabel(label));
  if (dup) return { next: existing, error: "A preset with that name already exists." };

  const next: TablePreset<P>[] = [{ ...preset }, ...existing].slice(0, max);
  savePresets(storageKey, next);
  return { next };
}

export function deleteSavedPreset<P extends Record<string, any>>(
  storageKey: string,
  existing: TablePreset<P>[],
  key: string
): TablePreset<P>[] {
  const next = existing.filter((p) => p.key !== key);
  savePresets(storageKey, next);
  return next;
}

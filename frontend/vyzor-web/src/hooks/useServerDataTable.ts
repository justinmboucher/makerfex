// src/hooks/useServerDataTable.ts
// ============================================================================
// useServerDataTable
// ----------------------------------------------------------------------------
// Thin, reusable server-driven table state:
// - debounced q
// - ordering
// - page / page_size
// - preset param bundles (backend-authoritative)
// - snap page back when dataset shrinks
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import type { TablePreset } from "../components/tables/tablePresets";

export type ServerTableParams<P extends Record<string, any> = Record<string, any>> = {
  q?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
} & P;

export type ServerTableResult<T> = {
  count: number;
  results: T[];
};

export type UseServerDataTableOptions<T, P extends Record<string, any>> = {
  fetcher: (params: ServerTableParams<P>) => Promise<ServerTableResult<T>>;
  debounceMs?: number;

  initial?: {
    q?: string;
    ordering?: string;
    page?: number;
    pageSize?: number;
  };

  // Extra backend params (filters) coming from the page (station, vip, etc.)
  extraParams?: Partial<P>;

  // Presets
  presets?: TablePreset<P>[];
  defaultPresetKey?: string;
};

export function useServerDataTable<T, P extends Record<string, any> = Record<string, any>>(
  opts: UseServerDataTableOptions<T, P>
) {
  const debounceMs = opts.debounceMs ?? 250;

  const fetcherRef = useRef(opts.fetcher);
  useEffect(() => {
    fetcherRef.current = opts.fetcher;
  }, [opts.fetcher]);

  const [q, setQ] = useState(opts.initial?.q ?? "");
  const [ordering, setOrdering] = useState(opts.initial?.ordering ?? "");
  const [page, setPage] = useState(opts.initial?.page ?? 1);
  const [pageSize, setPageSize] = useState(opts.initial?.pageSize ?? 25);

  // Presets: just param bundles merged into the request (backend does the truth).
  const [activePresetKey, setActivePresetKey] = useState<string>(opts.defaultPresetKey ?? "all");

  const activePresetParams = useMemo(() => {
    const list = opts.presets ?? [];
    const hit = list.find((p) => p.key === activePresetKey);
    return (hit?.params ?? {}) as Partial<P>;
  }, [opts.presets, activePresetKey]);

  const mergedParams = useMemo(() => {
    const out: ServerTableParams<P> = {
      page,
      page_size: pageSize,
    } as ServerTableParams<P>;

    // preset params first (so direct UI overrides can supersede later if you want)
    Object.assign(out, activePresetParams);

    // page-level filters next
    if (opts.extraParams) Object.assign(out, opts.extraParams);

    // q / ordering last (explicit table state)
    const qTrim = q.trim();
    if (qTrim) out.q = qTrim;
    if (ordering) out.ordering = ordering;

    return out;
  }, [page, pageSize, activePresetParams, opts.extraParams, q, ordering]);

  const [items, setItems] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageCount = useMemo(() => Math.max(1, Math.ceil((count || 0) / pageSize)), [count, pageSize]);

  function goToPage(nextPage: number) {
    setPage(() => Math.max(1, Math.min(pageCount, nextPage)));
  }

  // Debounce q changes: reset to page 1
  const qTimer = useRef<number | null>(null);
  useEffect(() => {
    if (qTimer.current) window.clearTimeout(qTimer.current);
    qTimer.current = window.setTimeout(() => {
      setPage(1);
    }, debounceMs);
    return () => {
      if (qTimer.current) window.clearTimeout(qTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Fetch
  useEffect(() => {
  let alive = true;
  setLoading(true);
  setError(null);

  (async () => {
    try {
      const res = await fetcherRef.current(mergedParams);
      if (!alive) return;

      setItems(res.results ?? []);
      setCount(res.count ?? 0);

      const nextPageCount = Math.max(1, Math.ceil((res.count ?? 0) / pageSize));
      if (page > nextPageCount) setPage(nextPageCount);
    } catch (e: any) {
      if (!alive) return;
      setError(e?.response?.data?.detail || e?.message || "Failed to load table data");
      setItems([]);
      setCount(0);
    } finally {
      if (!alive) return;
      setLoading(false);
    }
  })();

  return () => {
    alive = false;
  };
  // ✅ IMPORTANT: depend on mergedParams (and only what you truly need)
}, [mergedParams, page, pageSize]);

  function applyPreset(key: string) {
    setActivePresetKey(key);
    setPage(1);

    // If the preset includes q/ordering, apply them to state so the UI matches.
    const hit = (opts.presets ?? []).find((p) => p.key === key);
    const params: any = hit?.params ?? {};

    if ("q" in params) setQ(String(params.q ?? ""));
    if ("ordering" in params) setOrdering(String(params.ordering ?? ""));
    }

  function clearSorting() {
    setOrdering("");
    setPage(1);
  }

  function clearFilters() {
    setQ("");
    setOrdering("");
    setPage(1);
    setActivePresetKey(opts.defaultPresetKey ?? "all");
    }

  return {
    state: {
      q,
      ordering,
      page,
      pageSize,
      activePresetKey,
      items,
      count,
      pageCount,
      loading,
      error,
    },
    actions: {
      setQ,
      setOrdering: (val: string) => {
        setOrdering(val);
        setPage(1);
      },
      setPage,
      setPageSize: (n: number) => {
        setPageSize(n);
        setPage(1);
      },
      goToPage,
      applyPreset,
      clearSorting,
      clearFilters,
    },
  };
}

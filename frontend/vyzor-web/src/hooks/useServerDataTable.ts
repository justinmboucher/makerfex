// src/hooks/useServerDataTable.ts
// ============================================================================
// useServerDataTable
// ----------------------------------------------------------------------------
// Thin, reusable server-driven table state:
// - debounced q
// - ordering
// - page / page_size
// - preset param bundles (backend-authoritative)
// - extra params (page-level filters) with Option B support:
//    - controlled: opts.extraParams
//    - uncontrolled: internal state + actions.setExtraParams()
// - snap page back when dataset shrinks
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import type { TablePreset } from "../components/tables/tablePresets";

export type ServerTableParams<P = Record<string, any>> = {
  q?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
} & P;

export type ServerTableResult<T> = {
  count: number;
  results: T[];
};

export type UseServerDataTableOptions<T, P = Record<string, any>> = {
  fetcher: (params: ServerTableParams<P>) => Promise<ServerTableResult<T>>;
  debounceMs?: number;

  initial?: {
    q?: string;
    ordering?: string;
    page?: number;
    pageSize?: number;

    // ✅ Option B: allow initial uncontrolled extra params
    extraParams?: Partial<P>;
  };

  // ✅ Existing: controlled extra params (page-level filters)
  // If provided, hook treats extra params as controlled (no internal state mutation).
  extraParams?: Partial<P>;

  presets?: TablePreset[];
  defaultPresetKey?: string;
};

function cleanParamsObj(obj: Record<string, any>) {
  const next = { ...obj };
  Object.keys(next).forEach((k) => {
    const v = next[k];
    if (v === undefined || v === null || v === "") delete next[k];
  });
  return next;
}

export function useServerDataTable<T, P = Record<string, any>>(
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

  // Presets: param bundles merged into the request (backend does the truth).
  const [activePresetKey, setActivePresetKey] = useState(
    opts.defaultPresetKey ?? "all"
  );

  const activePresetParams = useMemo(() => {
    const list = opts.presets ?? [];
    const hit = list.find((p) => p.key === activePresetKey);
    return (hit?.params ?? {}) as Partial<P>;
  }, [opts.presets, activePresetKey]);

  // ✅ Option B: internal (uncontrolled) extra params
  const [extraParamsState, setExtraParamsState] = useState<Partial<P>>(
    (opts.initial?.extraParams ?? {}) as Partial<P>
  );

  // If opts.extraParams is provided, treat as controlled
  const effectiveExtraParams = (opts.extraParams ??
    extraParamsState) as Partial<P>;

  const mergedParams = useMemo(() => {
    const out: ServerTableParams<P> = {
      page,
      page_size: pageSize,
    } as ServerTableParams<P>;

    // preset params first
    Object.assign(out, activePresetParams);

    // extra params next (override preset if they overlap)
    if (effectiveExtraParams) Object.assign(out, effectiveExtraParams);

    // q / ordering last (explicit table state)
    const qTrim = q.trim();
    if (qTrim) out.q = qTrim;
    if (ordering) out.ordering = ordering;

    return out;
  }, [page, pageSize, activePresetParams, effectiveExtraParams, q, ordering]);

  const [items, setItems] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil((count || 0) / pageSize)),
    [count, pageSize]
  );

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

        const nextPageCount = Math.max(
          1,
          Math.ceil((res.count ?? 0) / pageSize)
        );
        if (page > nextPageCount) setPage(nextPageCount);
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.detail || e?.message || "Failed to load table data"
        );
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
  }, [mergedParams, page, pageSize]);

  function applyPreset(key: string) {
    setActivePresetKey(key);
    setPage(1);

    // If the preset includes q/ordering, apply them so the UI matches.
    const hit = (opts.presets ?? []).find((p) => p.key === key);
    const params: any = hit?.params ?? {};
    if ("q" in params) setQ(String(params.q ?? ""));
    if ("ordering" in params) setOrdering(String(params.ordering ?? ""));
  }

  function clearSorting() {
    setOrdering("");
    setPage(1);
  }

  // ✅ Option B: uncontrolled extra params actions (no-op if controlled)
  const isExtraParamsControlled = opts.extraParams !== undefined;

  function setExtraParams(patch: Partial<P>) {
    if (isExtraParamsControlled) return;
    setPage(1);
    setExtraParamsState((prev) => cleanParamsObj({ ...(prev as any), ...(patch as any) }) as Partial<P>);
  }

  function replaceExtraParams(next: Partial<P>) {
    if (isExtraParamsControlled) return;
    setPage(1);
    setExtraParamsState(cleanParamsObj(next as any) as Partial<P>);
  }

  function clearExtraParams() {
    if (isExtraParamsControlled) return;
    setPage(1);
    setExtraParamsState({} as Partial<P>);
  }

  function clearFilters() {
    setQ("");
    setOrdering("");
    setPage(1);
    setActivePresetKey(opts.defaultPresetKey ?? "all");
    // ✅ also clear extra params for uncontrolled mode
    if (!isExtraParamsControlled) setExtraParamsState({} as Partial<P>);
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
      extraParams: effectiveExtraParams, // useful for saving presets, UI state, etc.
      isExtraParamsControlled,
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
      // Option B actions
      setExtraParams,
      replaceExtraParams,
      clearExtraParams,
    },
  };
}

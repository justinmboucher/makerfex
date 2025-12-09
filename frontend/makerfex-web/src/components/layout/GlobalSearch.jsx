// src/components/layout/GlobalSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { TextField } from "../ui/TextField";
import { searchEverything } from "../../api/search";

/**
 * Parse filter syntax:
 *   customer: jo
 *   c:jo
 *   project:cnc
 *   price>50
 */
function parseSearchQuery(raw) {
  const text = raw.trim();
  if (!text) {
    return { query: "", filters: {} };
  }

  const tokens = text.split(/\s+/);
  const filters = {
    customer: false,
    project: false,
    inventory: false,
    workflow: false,
    price: null,
    price_op: null,
  };
  const keywords = [];

  for (const token of tokens) {
    const lower = token.toLowerCase();

    // --- type filters (long + short forms) ---

    // customer: / c:
    if (lower.startsWith("customer:") || lower.startsWith("c:")) {
      const prefixLen = lower.startsWith("customer:") ? "customer:".length : "c:".length;
      const value = token.slice(prefixLen);
      filters.customer = true;
      if (value) keywords.push(value);
      continue;
    }
    if (lower === "customer:" || lower === "c:") {
      filters.customer = true;
      continue;
    }

    // project: / p:
    if (lower.startsWith("project:") || lower.startsWith("p:")) {
      const prefixLen = lower.startsWith("project:") ? "project:".length : "p:".length;
      const value = token.slice(prefixLen);
      filters.project = true;
      if (value) keywords.push(value);
      continue;
    }
    if (lower === "project:" || lower === "p:") {
      filters.project = true;
      continue;
    }

    // inventory: / i:
    if (lower.startsWith("inventory:") || lower.startsWith("i:")) {
      const prefixLen = lower.startsWith("inventory:") ? "inventory:".length : "i:".length;
      const value = token.slice(prefixLen);
      filters.inventory = true;
      if (value) keywords.push(value);
      continue;
    }
    if (lower === "inventory:" || lower === "i:") {
      filters.inventory = true;
      continue;
    }

    // workflow: / w:
    if (lower.startsWith("workflow:") || lower.startsWith("w:")) {
      const prefixLen = lower.startsWith("workflow:") ? "workflow:".length : "w:".length;
      const value = token.slice(prefixLen);
      filters.workflow = true;
      if (value) keywords.push(value);
      continue;
    }
    if (lower === "workflow:" || lower === "w:") {
      filters.workflow = true;
      continue;
    }

    // --- price filters: price>50, price<=100, etc. ---
    const priceMatch = token.match(/^price(<=|>=|<|>|=)(\d+(\.\d+)?)$/i);
    if (priceMatch) {
      filters.price_op = priceMatch[1];
      filters.price = parseFloat(priceMatch[2]);
      continue;
    }

    // plain keyword
    keywords.push(token);
  }

  const query = keywords.join(" ");
  return { query, filters };
}

/**
 * Simple subsequence fuzzy match.
 * "mpl" will match "maple", "example", etc. if the sequence appears in order.
 */
function fuzzyMatch(needle, haystack) {
  if (!needle) return true;
  if (!haystack) return false;

  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();

  let i = 0;
  let j = 0;
  while (i < n.length && j < h.length) {
    if (n[i] === h[j]) {
      i += 1;
    }
    j += 1;
  }
  return i === n.length;
}

// Highlight matched keywords in a label (visual only)
function highlightLabel(label, rawInput) {
  if (!rawInput) return label;

  const { query } = parseSearchQuery(rawInput);
  if (!query) return label;

  const keywords = query.split(/\s+/).filter(Boolean);
  if (keywords.length === 0) return label;

  let result = label;
  keywords.forEach((kw) => {
    const pattern = new RegExp(`(${kw})`, "ig");
    result = result.replace(pattern, "§§$1§§");
  });

  const parts = result.split("§§");
  return parts.map((part, idx) =>
    keywords.some((kw) => kw.toLowerCase() === part.toLowerCase()) ? (
      <strong key={idx}>{part}</strong>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export function GlobalSearch({ onSearchChange }) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // nothing selected by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcuts: "/" and Ctrl/Cmd+K focus search
  useEffect(() => {
    function handleGlobalKey(e) {
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) {
        return;
      }

      // "/" focuses search
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
        setOpen(true);
      }

      // Ctrl+K / Cmd+K focuses search
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Debounced search when value changes
  useEffect(() => {
    onSearchChange?.(value);

    const trimmed = value.trim();
    const { query, filters } = parseSearchQuery(trimmed);

    const hasTypeFilter =
      filters.customer || filters.project || filters.inventory || filters.workflow;

    // If it's super short and has no operators, don't spam the API
    if (trimmed.length < 2 && !hasTypeFilter && !filters.price && !filters.price_op) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setError(null);
      if (abortRef.current) {
        abortRef.current.abort();
      }
      return;
    }

    // what we actually send to the backend.
    // For "p: shelf" this becomes "shelf", so aliases work properly.
    const backendQuery = query || trimmed;

    const handle = setTimeout(async () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        // Send the cleaned query string to the backend
        const data = await searchEverything(backendQuery, controller.signal);
        let limited = Array.isArray(data) ? data.slice(0, 50) : [];

        // 1) Type scoping: customer:, c:, etc.
        const requestedTypes = [];
        if (filters.customer) requestedTypes.push("customer");
        if (filters.project) requestedTypes.push("project");
        if (filters.inventory) requestedTypes.push("inventory");
        if (filters.workflow) requestedTypes.push("workflow");

        if (requestedTypes.length > 0) {
          limited = limited.filter((item) =>
            requestedTypes.includes((item.type || "").toLowerCase())
          );
        }

        // 2) Fuzzy name/label matching on whatever the backend returned.
        if (query) {
          limited = limited.filter((item) => {
            const label = item.label || "";
            const subtitle = item.subtitle || "";
            return (
              fuzzyMatch(query, label) ||
              (!requestedTypes.length && fuzzyMatch(query, subtitle))
            );
          });
        }

        // 3) price> / price< scoping (for now: only keep price-relevant types)
        if (filters.price || filters.price_op) {
          const priceTypes = ["project", "sale", "sales", "order", "invoice"];
          limited = limited.filter((item) =>
            priceTypes.includes((item.type || "").toLowerCase())
          );
        }

        const finalResults = limited.slice(0, 15);
        setResults(finalResults);

        // Always open the dropdown once a search actually ran
        setOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          return;
        }
        console.error("Global search error:", err);
        setError("Search failed");
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handle);
  }, [value, onSearchChange]);

  function handleKeyDown(e) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        if (results.length === 0) return -1;
        if (prev < 0) return 0;
        return prev < results.length - 1 ? prev + 1 : prev;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        if (prev <= 0) return -1;
        return prev - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        const item = results[activeIndex];
        if (item?.url) {
          navigate(item.url);
          setOpen(false);
          setActiveIndex(-1);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleResultClick(item) {
    if (item?.url) {
      navigate(item.url);
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function renderTypePill(type) {
    const t = (type || "").toLowerCase();
    const labelMap = {
      customer: "Customer",
      project: "Project",
      inventory: "Inventory",
      workflow: "Workflow",
    };
    const label = labelMap[t] || "Item";
    const cls = `mf-topbar__search-pill mf-topbar__search-pill--${t || "default"}`;
    return <span className={cls}>{label}</span>;
  }

  return (
    <div className="mf-topbar__search" ref={dropdownRef}>
      <TextField
        ref={inputRef}
        size="sm"
        placeholder="Search customers, projects, inventory..."
        leftIcon={<Search size={16} />}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <div className="mf-topbar__search-dropdown">
          {/* Header row with Advanced search */}
          <div className="mf-topbar__search-header">
            <button
              type="button"
              className="mf-topbar__search-advanced"
              onMouseDown={(e) => e.preventDefault()} // keep focus in input
              onClick={() => {
                setOpen(false);
                setActiveIndex(-1);
                navigate("/search");
              }}
            >
              Advanced search
            </button>
          </div>

          {loading && (
            <div className="mf-topbar__search-status">Searching…</div>
          )}

          {error && (
            <div className="mf-topbar__search-status mf-topbar__search-status--error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            results.length === 0 &&
            value.trim().length >= 2 && (
              <div className="mf-topbar__search-empty">
                No matches found
              </div>
            )}

          {!loading && !error && results.length > 0 && (
            <ul className="mf-topbar__search-list">
              {results.map((item, index) => (
                <li key={`${item.type}-${item.id || index}`}>
                  <button
                    type="button"
                    className={
                      index === activeIndex
                        ? "mf-topbar__search-item mf-topbar__search-item--active"
                        : "mf-topbar__search-item"
                    }
                    onMouseDown={(e) => {
                      // prevent TextField blur
                      e.preventDefault();
                    }}
                    onClick={() => handleResultClick(item)}
                  >
                    {renderTypePill(item.type)}
                    <div className="mf-topbar__search-item-text">
                      <div className="mf-topbar__search-item-label">
                        {highlightLabel(item.label || "", value)}
                      </div>
                      {item.subtitle && (
                        <div className="mf-topbar__search-item-subtitle">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

                    {/* Footer tips section */}
          {!loading && !error && (
            <div className="mf-topbar__search-footer">
              <div className="mf-topbar__search-divider"></div>
              <div className="mf-topbar__search-tips">
                <strong>Tips:</strong>{" "}
                <em>c:Jane</em>, <em>p:cutting</em>, <em>price&gt;50</em>
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}

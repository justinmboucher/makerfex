// src/pages/makerfex/Customers.tsx
// ============================================================================
// Makerfex Customers Page
// ----------------------------------------------------------------------------
// Server-driven customers list scoped to the logged-in user's shop.
// DRF contract: ?q=, ?ordering=, ?page=, ?page_size=
// No destructive actions.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Table, Spinner, Badge, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { listCustomers } from "../../api/customers";
import type { Customer } from "../../api/customers";

const PAGE_SIZES = [10, 25, 50, 100] as const;

function parsePageSize(v: string): number {
  const n = Number(v);
  return PAGE_SIZES.includes(n as any) ? n : 25;
}

function toggleOrdering(current: string, nextField: string): string {
  const isDesc = current === `-${nextField}`;
  const isAsc = current === nextField;

  if (!isAsc && !isDesc) return nextField; // none -> asc
  if (isAsc) return `-${nextField}`; // asc -> desc
  return ""; // desc -> none
}

function sortIndicator(ordering: string, field: string): string {
  if (ordering === field) return " ▲";
  if (ordering === `-${field}`) return " ▼";
  return "";
}

export default function Customers() {
  const [items, setItems] = useState<Customer[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Table state
  const [q, setQ] = useState("");
  const [ordering, setOrdering] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize]);

  function goToPage(nextPage: number) {
    setPage(() => {
      const target = Math.max(1, Math.min(pageCount, nextPage));
      return target;
    });
  }

  // Debounced server fetch
  useEffect(() => {
    let alive = true;
    setLoading(true);

    const t = window.setTimeout(() => {
      listCustomers({
        q: q.trim() ? q.trim() : undefined,
        ordering: ordering || undefined,
        page,
        page_size: pageSize,
      })
        .then((data) => {
          if (!alive) return;

          setItems(data.results);
          setCount(data.count);

          // Snap page back if dataset shrank
          const nextPageCount = Math.max(1, Math.ceil(data.count / pageSize));
          if (page > nextPageCount) setPage(nextPageCount);
        })
        .finally(() => {
          if (!alive) return;
          setLoading(false);
        });
    }, 250);

    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [q, ordering, page, pageSize]);

  const shownLabel = loading ? "Loading…" : `${items.length} shown • ${count} total`;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">Makerfex Customers</h4>
        <div className="text-muted">{shownLabel}</div>
      </div>

      {/* Controls row */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <Form.Control
          style={{ maxWidth: 320 }}
          placeholder="Search customers…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />

        <Form.Select
          style={{ width: 140 }}
          value={String(pageSize)}
          onChange={(e) => {
            setPageSize(parsePageSize(e.target.value));
            setPage(1);
          }}
          title="Rows per page"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </Form.Select>
      </div>

      {loading ? (
        <div className="py-4 d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading…</span>
        </div>
      ) : (
        <>
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th
                  role="button"
                  onClick={() => {
                    // name is derived; sort by last_name
                    setOrdering((cur) => toggleOrdering(cur, "last_name"));
                    setPage(1);
                  }}
                >
                  Name{sortIndicator(ordering, "last_name")}
                </th>

                <th
                  role="button"
                  onClick={() => {
                    setOrdering((cur) => toggleOrdering(cur, "email"));
                    setPage(1);
                  }}
                >
                  Email{sortIndicator(ordering, "email")}
                </th>

                <th
                  role="button"
                  onClick={() => {
                    setOrdering((cur) => toggleOrdering(cur, "phone"));
                    setPage(1);
                  }}
                >
                  Phone{sortIndicator(ordering, "phone")}
                </th>

                <th
                  role="button"
                  onClick={() => {
                    setOrdering((cur) => toggleOrdering(cur, "is_vip"));
                    setPage(1);
                  }}
                >
                  VIP{sortIndicator(ordering, "is_vip")}
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted py-4">
                    No customers found.
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/customers/${c.id}`}>{c.name || "—"}</Link>
                    </td>
                    <td>{c.email || "—"}</td>
                    <td>{c.phone || "—"}</td>
                    <td>
                      {c.is_vip ? (
                        <Badge bg="warning" text="dark">
                          VIP
                        </Badge>
                      ) : (
                        <Badge bg="secondary">Standard</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex align-items-center justify-content-between mt-3">
            <div className="text-muted">
              Page {page} of {pageCount}
            </div>

            <div className="d-flex gap-2">
              <Button variant="outline-secondary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                ← Prev
              </Button>
              <Button
                variant="outline-secondary"
                disabled={page >= pageCount}
                onClick={() => goToPage(page + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

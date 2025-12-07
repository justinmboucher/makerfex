// src/ui/components/Table.jsx
import React from "react";
import "./Table.css";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * DataTable
 *
 * Props:
 * - columns: [{ key, header, align?, render?(value, row) }]
 * - rows: array of data
 * - getRowId(row): optional, default row.id
 * - onRowClick(row): optional
 * - emptyMessage: string
 * - page, pageSize, total, onPageChange: optional pagination
 * - footerContent: ReactNode
 */
export function DataTable({
  columns,
  rows,
  getRowId = (row) => row.id,
  onRowClick,
  emptyMessage = "No records found.",
  page,
  pageSize,
  total,
  onPageChange,
  footerContent,
}) {
  const clickable = Boolean(onRowClick);

  const pageCount =
    typeof total === "number" && typeof pageSize === "number"
      ? Math.max(1, Math.ceil(total / pageSize))
      : null;

  const canPage =
    page != null && pageSize != null && total != null && onPageChange != null;

  const handlePrev = () => {
    if (!canPage) return;
    onPageChange(Math.max(1, page - 1));
  };

  const handleNext = () => {
    if (!canPage || pageCount == null) return;
    onPageChange(Math.min(pageCount, page + 1));
  };

  return (
    <div className="mf-table-container">
      <table className="mf-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={classNames(
                  col.align === "right" && "mf-table__cell--right",
                  col.align === "center" && "mf-table__cell--center",
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(!rows || rows.length === 0) && (
            <tr>
              <td colSpan={columns.length} className="mf-table__empty">
                {emptyMessage}
              </td>
            </tr>
          )}

          {rows?.map((row) => {
            const id = getRowId(row);
            return (
              <tr
                key={id}
                className={classNames(
                  clickable && "mf-table-row--clickable",
                )}
                onClick={clickable ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={classNames(
                      col.align === "right" && "mf-table__cell--right",
                      col.align === "center" && "mf-table__cell--center",
                    )}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {(canPage || footerContent) && (
        <div className="mf-table__footer">
          <div>{footerContent}</div>
          {canPage && (
            <div className="mf-table__pager">
              <button
                type="button"
                className="mf-table__pager-button"
                onClick={handlePrev}
                disabled={page <= 1}
              >
                Prev
              </button>
              <span>
                Page {page} {pageCount ? `of ${pageCount}` : null}
              </span>
              <button
                type="button"
                className="mf-table__pager-button"
                onClick={handleNext}
                disabled={pageCount != null && page >= pageCount}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

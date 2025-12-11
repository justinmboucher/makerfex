// src/components/dashboard/TableCard.jsx
import React from "react";
import { DashboardCard } from "./DashboardCard";

export function TableCard({ title, columns, rows, isLoading, error }) {
  return (
    <DashboardCard title={title} isLoading={isLoading} error={error}>
      <table className="mf-table dashboard-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty-table">
                No rows available
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardCard>
  );
}

// src/pages/makerfex/Customers.tsx
// ============================================================================
// Makerfex Customers Page
// ----------------------------------------------------------------------------
// Displays customers scoped to the logged-in user's shop.
// Uses Vyzor table layout and DRF pagination.
// ============================================================================

import { useEffect, useState } from "react";
import { Table, Spinner, Badge } from "react-bootstrap";
import { listCustomers } from "../../api/customers";
import type { Customer } from "../../api/customers";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCustomers()
      .then((data) => setCustomers(data.results))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="page-content">
      <h4 className="mb-3">Makerfex Customers</h4>

      <Table hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>VIP</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                No customers found.
              </td>
            </tr>
          )}

          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email || "—"}</td>
              <td>{c.phone || "—"}</td>
              <td>
                {c.is_vip ? (
                  <Badge bg="warning">VIP</Badge>
                ) : (
                  <Badge bg="secondary">Standard</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

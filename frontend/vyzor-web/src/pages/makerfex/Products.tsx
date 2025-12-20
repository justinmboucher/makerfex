// src/pages/makerfex/Products.tsx
// ============================================================================
// Products Page
// ----------------------------------------------------------------------------
// Purpose:
// - List product templates (reusable project blueprints)
// - Read-only v1
// ============================================================================

import { Card } from "react-bootstrap";
import ProductsTable from "../../components/makerfex/ProductsTable";

export default function Products() {
  return (
    <div className="container-fluid">
      <Card>
        <Card.Header className="fw-semibold">Products</Card.Header>
        <Card.Body>
          <ProductsTable />
        </Card.Body>
      </Card>
    </div>
  );
}

// src/pages/makerfex/Inventory.tsx
// ============================================================================
// Inventory Page
// ----------------------------------------------------------------------------
// Purpose:
// - Top-level Inventory view for Makerfex.
// - Hosts tabbed inventory tables (Materials / Consumables / Equipment).
// - Delegates all data behavior to InventoryTable (server-driven).
//
// Notes:
// - No business logic here.
// - No data fetching here.
// - This page is purely structural.
// ============================================================================

import { useState } from "react";
import { Card, Nav } from "react-bootstrap";

import InventoryTable from "../../components/makerfex/InventoryTable";

type InventoryTab = "materials" | "consumables" | "equipment";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<InventoryTab>("materials");

  return (
    <div className="container-fluid">
      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="fw-semibold">Inventory</div>

          <Nav
            variant="pills"
            activeKey={activeTab}
            onSelect={(k) => k && setActiveTab(k as InventoryTab)}
          >
            <Nav.Item>
              <Nav.Link eventKey="materials">Materials</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="consumables">Consumables</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="equipment">Equipment</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body>
          {activeTab === "materials" && (
            <InventoryTable kind="materials" />
          )}

          {activeTab === "consumables" && (
            <InventoryTable kind="consumables" />
          )}

          {activeTab === "equipment" && (
            <InventoryTable kind="equipment" />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

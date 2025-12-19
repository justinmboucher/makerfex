// src/pages/makerfex/Inventory.tsx
import { useState } from "react";
import { Card, Nav } from "react-bootstrap";
import InventoryTable from "../../components/makerfex/InventoryTable";

type TabKey = "materials" | "consumables" | "equipment";

export default function Inventory() {
  const [tab, setTab] = useState<TabKey>("materials");

  return (
    <div className="container-fluid">
      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="fw-semibold">Inventory</div>
          <Nav variant="pills" activeKey={tab} onSelect={(k) => k && setTab(k as TabKey)}>
            <Nav.Item><Nav.Link eventKey="materials">Materials</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="consumables">Consumables</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="equipment">Equipment</Nav.Link></Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body>
          {tab === "materials" ? <InventoryTable kind="materials" /> : null}
          {tab === "consumables" ? <InventoryTable kind="consumables" /> : null}
          {tab === "equipment" ? <InventoryTable kind="equipment" /> : null}
        </Card.Body>
      </Card>
    </div>
  );
}

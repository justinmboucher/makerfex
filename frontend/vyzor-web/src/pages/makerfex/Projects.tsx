// src/pages/makerfex/Projects.tsx
// ============================================================================
// Makerfex Projects Page
// ----------------------------------------------------------------------------
// Purpose:
// - Thin page wrapper that renders the reusable ProjectsTable.
// - Keeps Projects page consistent with Tasks/Inventory pattern.
// ============================================================================

import { Card } from "react-bootstrap";
import ProjectsTable from "../../components/makerfex/ProjectsTable";

export default function Projects() {
  return (
    <div className="container-fluid">
      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="fw-semibold">Projects</div>
        </Card.Header>

        <Card.Body>
          <ProjectsTable />
        </Card.Body>
      </Card>
    </div>
  );
}

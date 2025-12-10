// src/pages/Projects.jsx
import React from "react";
import { PageShell, PageSection } from "../components/layout/PageShell";
// import { ProjectsTable } from "../components/projects/ProjectsTable";

export function ProjectsPage() {
  return (
    <PageShell
      title="Projects"
      subtitle="Track active, on-hold, and completed work."
      eyebrow="Operations"
      primaryAction={{
        label: "New project",
        onClick: () => console.log("TODO: open create project"),
      }}
      toolbarContent={
        // later: extract to a reusable TableSearch component
        <div className="mf-projects-toolbar-search">
          <input
            type="text"
            placeholder="Search projects..."
            className="mf-projects-toolbar-search-input"
          />
        </div>
      }
    >
      <PageSection>
        {/* <ProjectsTable /> */}
        Projects table placeholder
      </PageSection>
    </PageShell>
  );
}

export default ProjectsPage;

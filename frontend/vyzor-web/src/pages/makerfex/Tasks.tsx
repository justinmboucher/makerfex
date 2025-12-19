// src/pages/makerfex/Tasks.tsx
// ============================================================================
// Makerfex Tasks Page (Read-only)
// ----------------------------------------------------------------------------
// Uses reusable <TasksTable /> for canonical server-driven table behavior.
// ============================================================================

import TasksTable from "../../components/makerfex/TasksTable";

export default function Tasks() {
  return (
    <>
      <h3>Tasks</h3>
      <TasksTable />
    </>
  );
}

// src/pages/makerfex/Kanban.tsx
// ============================================================================
// Makerfex Kanban (Employee Lens)
// ----------------------------------------------------------------------------
// - Columns are workflow stages (dynamic, backend-ordered).
// - Cards are tasks, but show project context (project_name) + due date + VIP.
// - If no workflow is selected, acts as a workflow launchpad.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner } from "react-bootstrap";

import { listWorkflows, listWorkflowStages } from "../../api/workflows";
import type { Workflow, WorkflowStage } from "../../api/workflows";

import { listTasks } from "../../api/tasks";
import type { Task } from "../../api/tasks";

// Optional: reuse the template card UI (fastest path)
import SpkKanbanCard from "../../shared/@spk-reusable-components/application-reusable/spk-kanbancard";

function formatDueLabel(iso: string | null): string {
  if (!iso) return "—";
  // ISO date expected; keep it simple and stable for now.
  return iso;
}

export default function Kanban() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const workflowParam = params.get("workflow");
  const workflowId = workflowParam ? Number(workflowParam) : null;

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Group tasks by stage id for rendering columns
  const tasksByStage = useMemo(() => {
    const map = new Map<number, Task[]>();
    for (const t of tasks) {
      if (t.stage == null) continue;
      if (!map.has(t.stage)) map.set(t.stage, []);
      map.get(t.stage)!.push(t);
    }
    return map;
  }, [tasks]);

  useEffect(() => {
    // Always load workflows (used for launchpad + selector)
    (async () => {
      const res = await listWorkflows({ is_active: 1, page_size: 200 });
      setWorkflows(res.items);
    })();
  }, []);

  useEffect(() => {
    if (!workflowId || Number.isNaN(workflowId)) {
      setStages([]);
      setTasks([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const [stRes, tRes] = await Promise.all([
          listWorkflowStages({ workflow: workflowId, is_active: 1, page_size: 500 }),
          listTasks({ workflow: workflowId, page_size: 500, ordering: "order" }),
        ]);

        // Ensure stage order is stable client-side too (backend already orders)
        const orderedStages = [...stRes.items].sort((a, b) => (a.order - b.order) || (a.id - b.id));
        setStages(orderedStages);
        setTasks(tRes.items);
      } finally {
        setLoading(false);
      }
    })();
  }, [workflowId]);

  function selectWorkflow(id: number) {
    navigate(`/kanban?workflow=${id}`);
  }

  // Launchpad state
  if (!workflowId) {
    return (
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">Kanban</h3>
        </div>

        <Card className="p-3">
          <h5 className="mb-2">Choose a workflow</h5>
          <div className="d-flex flex-wrap gap-2">
            {workflows.map((wf) => (
              <Button key={wf.id} variant="primary" onClick={() => selectWorkflow(wf.id)}>
                {wf.name}
              </Button>
            ))}
            {workflows.length === 0 && <div className="text-muted">No workflows found.</div>}
          </div>
        </Card>
      </div>
    );
  }

  // Board state
  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Kanban</h3>
        <div className="d-flex gap-2 flex-wrap">
          {workflows.map((wf) => (
            <Button
              key={wf.id}
              size="sm"
              variant={wf.id === workflowId ? "primary" : "outline-primary"}
              onClick={() => selectWorkflow(wf.id)}
            >
              {wf.name}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner animation="border" size="sm" /> Loading…
        </div>
      ) : (
        <div className="d-flex gap-3 overflow-auto pb-2">
          {stages.map((stage) => {
            const items = tasksByStage.get(stage.id) ?? [];
            return (
              <div key={stage.id} style={{ minWidth: 320, maxWidth: 360 }} className="flex-shrink-0">
                <Card className="p-2">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-semibold">{stage.name}</div>
                    <div className="text-muted small">{items.length}</div>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {items.map((t) => {
                      const due = t.due_date ?? t.project_due_date ?? null;

                      // Map Task -> template Kanban card shape
                      const cardModel = {
                        createdDate: t.created_at?.slice(0, 10) ?? "—",
                        daysLeft: formatDueLabel(due),
                        tags: [
                          t.is_vip ? "VIP" : "",
                          t.status ?? "",
                        ].filter(Boolean),
                        comments: "0",
                        likes: "0",
                        avatars: [],
                        Content: true,
                        title: t.title,
                        description: t.project_name ? `Project: ${t.project_name}` : "Project: —",
                      };

                      return (
                        <div key={t.id}>
                          <SpkKanbanCard kanban={cardModel} />
                        </div>
                      );
                    })}

                    {items.length === 0 && <div className="text-muted small p-2">No tasks.</div>}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

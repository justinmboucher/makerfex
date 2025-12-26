// src/pages/makerfex/Kanban.tsx
// ============================================================================
// Makerfex Kanban (Employee Lens)
// ----------------------------------------------------------------------------
// - Columns are workflow stages (dynamic, backend-ordered).
// - Cards are tasks, but show project context (project_name) + due date + VIP.
// - Drag-and-drop enabled via Dragula (backend-authoritative).
// - IMPORTANT: We use "mirror-only" dragging so Dragula never moves React-owned DOM nodes.
// - If no workflow is selected, acts as a workflow launchpad.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner } from "react-bootstrap";
import dragula from "dragula";
import "dragula/dist/dragula.css";

import { listWorkflows, listWorkflowStages } from "../../api/workflows";
import type { Workflow, WorkflowStage } from "../../api/workflows";

import { listTasks, updateTask } from "../../api/tasks";
import type { Task } from "../../api/tasks";

import SpkKanbanCard from "../../shared/@spk-reusable-components/application-reusable/spk-kanbancard";

type StagePalette = { bg: string; border: string };

function formatDueLabel(iso: string | null): string {
  if (!iso) return "—";
  return iso;
}

function getStageStyle(stageOrder: number): StagePalette {
  const palette: StagePalette[] = [
    { bg: "rgba(93, 95, 239, 0.08)", border: "rgba(93, 95, 239, 0.25)" }, // indigo
    { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.25)" }, // green
    { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.25)" }, // amber
    { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.25)" }, // red
    { bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.25)" }, // blue
    { bg: "rgba(168, 85, 247, 0.08)", border: "rgba(168, 85, 247, 0.25)" }, // purple
  ];
  return palette[Math.abs(stageOrder) % palette.length];
}

function getStageIdFromContainer(container: Element | null): number | null {
  if (!container) return null;
  const v = (container as HTMLElement).dataset.stageId;
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getTaskIdFromEl(el: Element | null): number | null {
  if (!el) return null;
  const v = (el as HTMLElement).dataset.taskId;
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getOrderWithinContainer(target: Element, draggedTaskId: number): number {
  // Count task wrappers in DOM order (ignore placeholders)
  const taskChildren = Array.from(target.children).filter(
    (c) => (c as HTMLElement).dataset.taskId != null
  ) as HTMLElement[];

  // In mirror-only mode the real node never enters target, so we approximate:
  // - If target has tasks, drop to end by default
  // (If you want precise index, we can compute from pointer position later.)
  // This is still backend authoritative; order will normalize on reload.
  const idx = taskChildren.findIndex((c) => Number(c.dataset.taskId) === draggedTaskId);
  if (idx >= 0) return idx; // if somehow already there
  return taskChildren.length;
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
  const [error, setError] = useState<string | null>(null);

  const stageContainersRef = useRef<Record<number, HTMLDivElement | null>>({});
  const drakeRef = useRef<ReturnType<typeof dragula> | null>(null);

  // Group tasks by stage id
  const tasksByStage = useMemo(() => {
    const map = new Map<number, Task[]>();
    for (const t of tasks) {
      if (t.stage == null) continue;
      if (!map.has(t.stage)) map.set(t.stage, []);
      map.get(t.stage)!.push(t);
    }
    // stable sort per column
    for (const [sid, arr] of map.entries()) {
      arr.sort((a, b) => (a.order - b.order) || (a.id - b.id));
      map.set(sid, arr);
    }
    return map;
  }, [tasks]);

  useEffect(() => {
    (async () => {
      const res = await listWorkflows({ is_active: 1, page_size: 200 });
      setWorkflows(res.items);
    })();
  }, []);

  async function reloadBoardData(activeWorkflowId: number) {
    const [stRes, tRes] = await Promise.all([
      listWorkflowStages({ workflow: activeWorkflowId, is_active: 1, page_size: 500 }),
      listTasks({ workflow: activeWorkflowId, page_size: 500, ordering: "order" }),
    ]);

    const orderedStages = [...stRes.items].sort((a, b) => (a.order - b.order) || (a.id - b.id));
    setStages(orderedStages);
    setTasks(tRes.items);
  }

  useEffect(() => {
    if (!workflowId || Number.isNaN(workflowId)) {
      setStages([]);
      setTasks([]);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        await reloadBoardData(workflowId);
      } catch (e: unknown) {
        console.error("Kanban load failed", e);
        const msg = e instanceof Error ? e.message : "Failed to load Kanban data.";
        setError(msg);
        setStages([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [workflowId]);

  // Dragula (mirror-only)
  useEffect(() => {
    if (!workflowId || stages.length === 0) return;

    // destroy previous instance
    if (drakeRef.current) {
      drakeRef.current.destroy();
      drakeRef.current = null;
    }

    const containers = stages
      .map((s) => stageContainersRef.current[s.id])
      .filter((el): el is HTMLDivElement => Boolean(el));

    if (containers.length === 0) return;

    const drake = dragula(containers, {
      // Mirror-only drag: don't move the real element between lists
      copy: true,
      revertOnSpill: true,
      removeOnSpill: true,
      mirrorContainer: document.body,

      moves: (el: Element) => (el as HTMLElement).dataset.taskId != null,
      accepts: (_el: Element, target: Element | null) => getStageIdFromContainer(target) != null,
      invalid: (_el: Element, _handle: Element) => false,
    });

    drake.on("drop", async (el: Element, target: Element | null) => {
      try {
        setError(null);

        if (!workflowId || !target) return;

        const taskId = getTaskIdFromEl(el);
        const newStageId = getStageIdFromContainer(target);

        if (!taskId || !newStageId) return;

        const newOrder = getOrderWithinContainer(target, taskId);

        // Optimistic update so UI changes immediately (React owns the DOM)
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, stage: newStageId, order: newOrder } : t))
        );

        await updateTask(taskId, { stage: newStageId, order: newOrder });

        // Backend authoritative refresh
        await reloadBoardData(workflowId);
      } catch (e: unknown) {
        console.error("Drag/drop failed", e);
        const msg = e instanceof Error ? e.message : "Failed to move task.";
        setError(msg);
        if (workflowId) await reloadBoardData(workflowId);
      }
    });

    drakeRef.current = drake;

    return () => {
      drake.destroy();
      drakeRef.current = null;
    };
  }, [workflowId, stages]);

  function selectWorkflow(id: number) {
    navigate(`/kanban?workflow=${id}`);
  }

  // Launchpad
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

  // Board
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

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner animation="border" size="sm" /> Loading…
        </div>
      ) : (
        <div className="d-flex gap-3 overflow-auto pb-2">
          {stages.map((stage) => {
            const items = tasksByStage.get(stage.id) ?? [];
            const tint = getStageStyle(stage.order);

            return (
              <div key={stage.id} style={{ minWidth: 320, maxWidth: 360 }} className="flex-shrink-0">
                <Card
                  className="p-2"
                  style={{
                    background: tint.bg,
                    borderColor: tint.border,
                    borderWidth: 1,
                    borderStyle: "solid",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-semibold">{stage.name}</div>
                    <div className="text-muted small">{items.length}</div>
                  </div>

                  <div
                    ref={(el) => {
                      stageContainersRef.current[stage.id] = el;
                    }}
                    data-stage-id={stage.id}
                    className="d-flex flex-column gap-2"
                    style={{ minHeight: 40 }}
                  >
                    {items.map((t) => {
                      const due = (t as any).project_due_date ? (t as any).project_due_date : t.due_date;

                      const cardModel = {
                        createdDate: t.created_at?.slice(0, 10) ?? "—",
                        daysLeft: formatDueLabel(due ?? null),
                        tags: [(t as any).is_vip ? "VIP" : "", t.status ?? ""].filter(Boolean),
                        comments: "0",
                        likes: "0",
                        avatars: [],
                        Content: true,
                        title: t.title,
                        description: (t as any).project_name
                          ? `Project: ${(t as any).project_name}`
                          : "Project: —",
                      };

                      // IMPORTANT: React owns this node; Dragula will only copy/mirror it.
                      return (
                        <div key={t.id} data-task-id={t.id}>
                          <SpkKanbanCard kanban={cardModel} />
                        </div>
                      );
                    })}

                    {items.length === 0 && (
                      <div className="text-muted small p-2" style={{ pointerEvents: "none" }}>
                        No tasks.
                      </div>
                    )}
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

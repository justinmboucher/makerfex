// src/api/tasks.ts
// ============================================================================
// Makerfex Tasks API (Frontend)
// ----------------------------------------------------------------------------
// Supports canonical server-driven table contract params:
// - q, ordering, page, page_size
// - status/project/station/stage/assignee/unassigned/is_overdue/due_before/due_after
// ============================================================================

import axiosClient from "./axiosClient";

export type Task = {
  id: number;
  shop: number;

  project: number | null;
  project_name?: string | null;
  project_due_date?: string | null;
  is_vip?: boolean;

  title: string;
  description: string | null;

  status: string;
  stage: number | null;
  station: number | null;
  assignee: number | null;

  order: number;
  estimated_hours: number | null;
  actual_hours: number | null;

  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;
};

export type TaskListResponse = {
  items: Task[];
  count?: number;
};

type DRFPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function unwrapList<T>(data: any): { items: T[]; count?: number } {
  if (Array.isArray(data)) return { items: data };
  if (data && Array.isArray(data.results)) return { items: data.results, count: data.count };
  if (data && Array.isArray(data.items)) return { items: data.items, count: data.count };
  return { items: [], count: 0 };
}

const BASE = "tasks/tasks/";

export async function listTasks(params?: Record<string, any>): Promise<TaskListResponse> {
  const res = await axiosClient.get<DRFPaginated<Task> | Task[] | TaskListResponse>(BASE, { params });
  return unwrapList<Task>(res.data);
}

export async function getTask(id: number): Promise<Task> {
  const res = await axiosClient.get<Task>(`${BASE}${id}/`);
  return res.data;
}

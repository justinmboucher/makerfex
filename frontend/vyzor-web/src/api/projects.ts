// src/api/projects.ts
// ============================================================================
// Makerfex Projects API (Frontend)
// ----------------------------------------------------------------------------
// - Supports DRF pagination ({count,next,previous,results})
// - Supports array responses (non-paginated) as fallback
// ============================================================================

import axiosClient from "./axiosClient";

export type Project = {
  id: number;
  shop: number;

  customer: number | null;
  customer_name: string | null;

  photo_url: string | null;

  name: string;
  reference_code: string;
  description: string;

  workflow: number | null;
  workflow_name?: string | null;

  current_stage: number | null;
  current_stage_name?: string | null;

  station?: number | null;
  station_name?: string | null;

  priority: "low" | "normal" | "high" | "rush";
  status: "active" | "on_hold" | "completed" | "cancelled";

  // backend-derived
  is_completed?: boolean;
  can_log_sale?: boolean;

  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;

  created_by: number | null;
  created_by_name: string | null;

  assigned_to: number | null;
  assigned_to_name: string | null;

  estimated_hours: string | null;
  actual_hours: string | null;

  is_archived: boolean;

  created_at: string;
  updated_at: string;
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
  return { items: [] };
}

export async function listProjects(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<Project> | Project[]>("/projects/", { params });
  return unwrapList<Project>(res.data);
}

export async function getProject(id: number): Promise<Project> {
  const res = await axiosClient.get<Project>(`/projects/${id}/`);
  return res.data;
}

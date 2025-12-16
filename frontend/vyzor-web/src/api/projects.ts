// src/api/projects.ts
// ============================================================================
// Makerfex Projects API (Frontend)
// ----------------------------------------------------------------------------
// Purpose:
// - Single source of truth for calling the Projects backend endpoints.
// - Handles DRF list responses whether paginated ({results,...}) or plain arrays.
//
// Important:
// - Backend currently returns FK fields (shop/customer/workflow/current_stage/etc)
//   as IDs (not nested objects). :contentReference[oaicite:3]{index=3}
// ============================================================================

import axiosClient from "./axiosClient";

export type Project = {
  id: number;
  shop: number;
  customer: number | null;
  photo_url: string | null;
  name: string;
  reference_code: string;
  description: string;
  workflow: number | null;
  current_stage: number | null;
  priority: "low" | "normal" | "high" | "rush";
  status: "active" | "on_hold" | "completed" | "cancelled";
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_by: number | null;
  assigned_to: number | null;
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

export async function getProject(id: number) {
  const res = await axiosClient.get<Project>(`/projects/${id}/`);
  return res.data;
}

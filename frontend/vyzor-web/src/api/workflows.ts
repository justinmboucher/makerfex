// src/api/workflows.ts
// ============================================================================
// Makerfex Workflows API (Frontend) - read-only list/detail usage for now.
// ============================================================================

import axiosClient from "./axiosClient";

export type Workflow = {
  id: number;
  shop: number;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type WorkflowStage = {
  id: number;
  workflow: number;
  name: string;
  order: number;
  is_initial: boolean;
  is_final: boolean;
  wip_limit: number | null;
  is_active: boolean;
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
  if (data && Array.isArray(data.items)) return { items: data.items, count: data.count };
  return { items: [], count: 0 };
}

const WORKFLOWS_BASE = "workflows/";
const STAGES_BASE = "workflows/stages/";

export async function listWorkflows(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<Workflow> | Workflow[]>(WORKFLOWS_BASE, { params });
  return unwrapList<Workflow>(res.data);
}

// Preferred name going forward
export async function listWorkflowStages(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<WorkflowStage> | WorkflowStage[]>(STAGES_BASE, { params });
  return unwrapList<WorkflowStage>(res.data);
}

// Back-compat alias (keep existing imports working)
export async function listStages(params?: Record<string, any>) {
  return listWorkflowStages(params);
}

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

function unwrapList<T>(data: any): { items: T[]; count?: number } {
  if (Array.isArray(data)) return { items: data };
  if (data && Array.isArray(data.results)) return { items: data.results, count: data.count };
  return { items: [] };
}

const WORKFLOWS_BASE = "workflows/workflows/";
const STAGES_BASE = "workflows/stages/";

export async function listWorkflows(params?: Record<string, any>) {
  const res = await axiosClient.get<Workflow[] | any>(WORKFLOWS_BASE, { params });
  return unwrapList<Workflow>(res.data);
}

export async function listStages(params?: Record<string, any>) {
  const res = await axiosClient.get<WorkflowStage[] | any>(STAGES_BASE, { params });
  return unwrapList<WorkflowStage>(res.data);
}

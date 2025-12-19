// src/api/employees.ts
// ============================================================================
// Makerfex Employees API (Frontend)
// ----------------------------------------------------------------------------
// Read-only usage for now (list + detail).
// Supports server-driven table contract params:
// - q, ordering, page, page_size, plus backend filters (e.g. is_active)
// - with_counts=1 to enrich list results (assigned_project_count, overdue_project_count)
// ============================================================================

import axiosClient from "./axiosClient";

export type Employee = {
  id: number;
  shop: number;
  user: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string | null;
  photo: string | null;
  photo_url: string | null;
  is_manager: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Optional enrichment when with_counts=1
  assigned_project_count?: number;
  overdue_project_count?: number;

  // Optional convenience field (some serializers provide this)
  display_name?: string;
};

export type EmployeeListResponse = {
  items: Employee[];
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

const BASE = "accounts/employees/";

export async function listEmployees(params?: Record<string, any>): Promise<EmployeeListResponse> {
  const res = await axiosClient.get<DRFPaginated<Employee> | Employee[] | EmployeeListResponse>(BASE, { params });
  return unwrapList<Employee>(res.data);
}

export async function getEmployee(id: number): Promise<Employee> {
  const res = await axiosClient.get<Employee>(`${BASE}${id}/`);
  return res.data;
}

export async function getMyEmployee(): Promise<Employee> {
  const res = await axiosClient.get<Employee>(`${BASE}me/`);
  return res.data;
}

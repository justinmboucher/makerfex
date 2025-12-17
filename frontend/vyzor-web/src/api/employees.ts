// src/api/employees.ts
// ============================================================================
// Makerfex Employees API (Frontend)
// ----------------------------------------------------------------------------
// Read-only usage for now (list + detail).
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

const BASE = "accounts/employees/";

export async function listEmployees(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<Employee> | Employee[]>(BASE, { params });
  return unwrapList<Employee>(res.data);
}

export async function getEmployee(id: number): Promise<Employee> {
  const res = await axiosClient.get<Employee>(`${BASE}${id}/`);
  return res.data;
}

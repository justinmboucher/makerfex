// src/api/employees.ts
// ============================================================================
// Makerfex Employees API (Frontend)
// ----------------------------------------------------------------------------
// Read-only usage for now (list + detail + "me").
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

// Cache the entire "me" employee object (small + useful)
const ME_CACHE_KEY = "mf_employee_me";

export async function listEmployees(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<Employee> | Employee[]>(BASE, { params });
  return unwrapList<Employee>(res.data);
}

export async function getEmployee(id: number): Promise<Employee> {
  const res = await axiosClient.get<Employee>(`${BASE}${id}/`);
  return res.data;
}

export function clearMyEmployeeCache() {
  localStorage.removeItem(ME_CACHE_KEY);
}

export async function getMyEmployee(opts?: { forceRefresh?: boolean }): Promise<Employee> {
  const forceRefresh = !!opts?.forceRefresh;

  if (!forceRefresh) {
    const cached = localStorage.getItem(ME_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as Employee;
      } catch {
        localStorage.removeItem(ME_CACHE_KEY);
      }
    }
  }

  // Uses same BASE style as everything else
  const res = await axiosClient.get<Employee>(`${BASE}me/`);
  const employee = res.data;

  localStorage.setItem(ME_CACHE_KEY, JSON.stringify(employee));
  return employee;
}

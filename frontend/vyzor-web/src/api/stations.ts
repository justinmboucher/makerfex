// src/api/stations.ts
// ============================================================================
// Makerfex Stations API (Frontend)
// ----------------------------------------------------------------------------
// Read-only usage for now (list + detail).
// ============================================================================

import axiosClient from "./axiosClient";

export type Station = {
  id: number;
  shop: number;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  employee_count?: number;
  employees?: number[]; // ids
  created_at: string;
  updated_at: string;
};

export type StationEmployeeMini = {
  id: number;
  first_name: string;
  last_name: string;
  role: string | null;
  is_active: boolean;
  display_name: string;
};

export type StationDetail = Station & {
  employees_detail?: StationEmployeeMini[];
};

function unwrapList<T>(data: any): { items: T[]; count?: number } {
  if (Array.isArray(data)) return { items: data };
  if (data && Array.isArray(data.results)) return { items: data.results, count: data.count };
  return { items: [] };
}

const BASE = "accounts/stations/";

export async function listStations(params?: Record<string, any>) {
  const res = await axiosClient.get<Station[] | any>(BASE, { params });
  return unwrapList<Station>(res.data);
}

export async function getStation(id: number): Promise<StationDetail> {
  const res = await axiosClient.get(`${BASE}${id}/`);
  return res.data;
}

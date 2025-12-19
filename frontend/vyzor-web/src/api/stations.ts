// src/api/stations.ts
// ============================================================================
// Makerfex Stations API (Frontend)
// ----------------------------------------------------------------------------
// Read-only usage for now (list + detail).
// Supports server-driven table contract params:
// - q, ordering, page, page_size, plus backend filters (e.g. is_active)
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

export type StationListResponse = {
  items: Station[];
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

const BASE = "accounts/stations/";

export async function listStations(params?: Record<string, any>): Promise<StationListResponse> {
  const res = await axiosClient.get<DRFPaginated<Station> | Station[] | StationListResponse>(BASE, { params });
  return unwrapList<Station>(res.data);
}

export async function getStation(id: number): Promise<StationDetail> {
  const res = await axiosClient.get<StationDetail>(`${BASE}${id}/`);
  return res.data;
}

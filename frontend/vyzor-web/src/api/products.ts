// src/api/products.ts
// ============================================================================
// Makerfex Products API (Frontend)
// ----------------------------------------------------------------------------
// - Product Templates (primary)
// - DRF pagination compatible
// ============================================================================

import axiosClient from "./axiosClient";

export type ProductTemplate = {
  id: number;
  shop: number;

  name: string;
  slug: string;
  description: string;

  photo: string | null;
  photo_url?: string | null;

  base_price: string | null;
  estimated_hours: string | null;

  default_workflow: number | null;
  default_workflow_name?: string | null;

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
  if (data?.results) return { items: data.results, count: data.count };
  return { items: [], count: 0 };
}

export async function listProductTemplates(params?: Record<string, any>) {
  const res = await axiosClient.get<
    DRFPaginated<ProductTemplate> | ProductTemplate[]
  >("/products/templates/", { params });

  return unwrapList<ProductTemplate>(res.data);
}

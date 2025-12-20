// src/api/inventory.ts
// ============================================================================
// Makerfex Inventory API (Frontend)
// ----------------------------------------------------------------------------
// Canonical server-driven list params:
// - q, ordering, page, page_size
// Inventory filters (backend):
// - is_active ("1"/"0"), low_stock ("1"/"0"), preferred_station
// ============================================================================

import axiosClient from "./axiosClient";

export type InventoryBase = {
  id: number;
  shop: number;

  image: string | null;
  image_url: string | null;

  name: string;
  sku: string;
  description: string;

  unit_of_measure: string;

  // DRF Decimal -> string
  quantity_on_hand: string;
  reorder_point: string;

  // DRF Decimal -> string | null
  unit_cost: string | null;

  preferred_station: number | null;
  is_active: boolean;

  created_at: string;
  updated_at: string;
};

export type Material = InventoryBase & {
  material_type: string;
};

export type Consumable = InventoryBase & {
  consumable_type: string;
};

export type Equipment = InventoryBase & {
  serial_number: string;
  purchase_date: string | null;
  warranty_expiration: string | null;
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
  return { items: [], count: 0 };
}

const BASE_MATERIALS = "/inventory/materials/";
const BASE_CONSUMABLES = "/inventory/consumables/";
const BASE_EQUIPMENT = "/inventory/equipment/";

export async function listMaterials(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<Material> | Material[]>(BASE_MATERIALS, { params });
  return unwrapList<Material>(res.data);
}

export async function listConsumables(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<Consumable> | Consumable[]>(BASE_CONSUMABLES, { params });
  return unwrapList<Consumable>(res.data);
}

export async function listEquipment(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<Equipment> | Equipment[]>(BASE_EQUIPMENT, { params });
  return unwrapList<Equipment>(res.data);
}

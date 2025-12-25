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

export type InventoryType = "material" | "consumable" | "equipment";

export type InventoryBase = {
  id: number;
  shop: number;
  image: string | null;
  image_url: string | null;
  name: string;
  sku: string;
  description: string;
  unit_of_measure: string;
  quantity_on_hand: string; // DRF Decimal -> string
  reorder_point: string; // DRF Decimal -> string
  unit_cost: string | null; // DRF Decimal -> string | null
  preferred_station: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Material = InventoryBase & { material_type: string };
export type Consumable = InventoryBase & { consumable_type: string };
export type Equipment = InventoryBase & {
  equipment_type: string;
  serial_number: string;
  purchase_date: string | null;
  warranty_expiration: string | null;
};

export type InventoryTransaction = {
  id: number;
  shop: number;
  inventory_type: InventoryType;
  material: number | null;
  consumable: number | null;
  equipment: number | null;
  project: number | null;
  bom_snapshot_type: string;
  bom_snapshot_id: number | null;
  quantity_delta: string;
  reason: "consume" | "adjustment" | "waste" | "return";
  station: number | null;
  created_by: number | null;
  notes: string;
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

export type ConsumeInventoryPayload = {
  inventory_type: InventoryType;
  inventory_id: number;
  quantity: string | number;

  project_id?: number;
  station_id?: number;
  notes?: string;

  bom_snapshot_type?: InventoryType;
  bom_snapshot_id?: number;
};

export async function consumeInventory(payload: ConsumeInventoryPayload) {
  const res = await axiosClient.post("/inventory/consume/", payload);
  return res.data as { detail: string; transaction: InventoryTransaction };
}

export async function listInventoryTransactions(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFPaginated<InventoryTransaction> | InventoryTransaction[]>(
    "/inventory/transactions/",
    { params }
  );
  return unwrapList<InventoryTransaction>(res.data);
}

export async function getMaterial(id: number) {
  const res = await axiosClient.get<Material>(`${BASE_MATERIALS}${id}/`);
  return res.data;
}

export async function getConsumable(id: number) {
  const res = await axiosClient.get<Consumable>(`${BASE_CONSUMABLES}${id}/`);
  return res.data;
}

export async function getEquipment(id: number) {
  const res = await axiosClient.get<Equipment>(`${BASE_EQUIPMENT}${id}/`);
  return res.data;
}

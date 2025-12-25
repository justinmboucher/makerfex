// src/api/sales.ts
import axiosClient from "./axiosClient";

export type SalesOrderLine = {
  id: number;
  order: number;
  product_template: number | null;
  project: number | null;
  description: string;
  quantity: string;
  unit_price: string;
  line_total: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesOrder = {
  id: number;
  shop: number;
  customer: number | null;
  project: number | null;

  order_number: string;
  status: "draft" | "open" | "paid" | "cancelled" | "refunded";
  source: "etsy" | "website" | "pos" | "other";

  order_date: string | null;
  due_date: string | null;

  currency_code: string;
  subtotal_amount: string | null;
  tax_amount: string | null;
  total_amount: string | null;

  notes: string;
  lines?: SalesOrderLine[];

  created_at: string;
  updated_at: string;
};

type DRFList<T> = { count: number; next: string | null; previous: string | null; results: T[] };

function unwrapList<T>(data: any): { items: T[]; count?: number } {
  if (Array.isArray(data)) return { items: data };
  if (data && Array.isArray(data.results)) return { items: data.results, count: data.count };
  return { items: [], count: 0 };
}

export async function listSalesOrders(params?: Record<string, any>) {
  const res = await axiosClient.get<DRFList<SalesOrder> | SalesOrder[]>("/sales/orders/", { params });
  return unwrapList<SalesOrder>(res.data);
}

export async function getSalesOrder(id: number): Promise<SalesOrder> {
  const res = await axiosClient.get<SalesOrder>(`/sales/orders/${id}/`);
  return res.data;
}

export type LogSaleFromProjectPayload = {
  project_id: number;
  total_amount: string;
  order_date?: string; // YYYY-MM-DD
  notes?: string;
  source?: "etsy" | "website" | "pos" | "other";
  archive_project?: boolean;
  create_product_template?: boolean;
  new_template_name?: string;
};

export async function logSaleFromProject(payload: LogSaleFromProjectPayload): Promise<SalesOrder> {
  const res = await axiosClient.post<SalesOrder>("/sales/orders/log_from_project/", payload);
  return res.data;
}

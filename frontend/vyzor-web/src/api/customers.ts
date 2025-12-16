// src/api/customers.ts
// ============================================================================
// Customers API
// ----------------------------------------------------------------------------
// Typed API access for Customer resources.
// All requests are automatically shop-scoped by the backend using the
// authenticated user -> employee -> shop relationship.
// ============================================================================

import axiosClient from "./axiosClient";

export type Customer = {
  id: number;
  shop: number;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  is_vip: boolean;
  created_at: string;
};

export type PaginatedCustomers = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
};

export async function listCustomers(): Promise<PaginatedCustomers> {
  const res = await axiosClient.get("/customers/");
  return res.data;
}

export async function getCustomer(id: number): Promise<Customer> {
  const res = await axiosClient.get(`/customers/${id}/`);
  return res.data;
}

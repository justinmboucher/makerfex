// src/api/customers.ts
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

export type ListCustomersParams = {
  q?: string;
  ordering?: string;
  page?: number;
  page_size?: number;

  // future-friendly: backend filters (keep frontend thin)
  vip?: 1;
};

export async function listCustomers(params: ListCustomersParams = {}): Promise<PaginatedCustomers> {
  const res = await axiosClient.get("/customers/", { params });
  return res.data;
}

export async function getCustomer(id: number): Promise<Customer> {
  const res = await axiosClient.get(`/customers/${id}/`);
  return res.data;
}


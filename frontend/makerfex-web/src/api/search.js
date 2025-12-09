// src/api/search.js
import axiosClient from "./axiosClient";

/**
 * q should already be the cleaned "query" part from GlobalSearch
 * filters are currently ignored by the backend but kept for future use.
 */
export async function searchEverything(q, signal) {
  if (!q) {
    return [];
  }

  const params = { q };

  try {
    const response = await axiosClient.get("/search/", {
      params,
      signal,
    });
    return response.data || [];
  } catch (err) {
    console.warn("[GlobalSearch] /api/search/ error, returning empty results.", err);
    return [];
  }
}

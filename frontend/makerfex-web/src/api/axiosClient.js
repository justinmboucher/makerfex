// src/api/axiosClient.js
import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "../auth/tokenStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach Authorization header on every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 by trying refresh once
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error?.response?.status;
    const isAuthEndpoint =
      originalRequest?.url?.includes("/accounts/token/") ||
      originalRequest?.url?.includes("/accounts/token/refresh/");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Use plain axios so we don't hit our own interceptors again
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/accounts/token/refresh/`,
          { refresh }
        );

        const newAccess = refreshResponse.data.access;
        // We only need to update the access token;
        // refresh usually stays the same unless you're rotating tokens.
        setAccessToken(newAccess);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default axiosClient;

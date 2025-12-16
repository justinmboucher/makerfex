import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../auth/tokenStorage";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "";
const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`;

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;

    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    // Don’t refresh on token endpoints; avoid loops.
    const url = (originalRequest.url || "").toString();
    if (url.includes("/accounts/token")) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Only retry once
    if (originalRequest._retry) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      // Use plain axios (not axiosClient) to avoid interceptor recursion
      const refreshResponse = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccess = (refreshResponse.data as any).access as string | undefined;
      if (!newAccess) throw new Error("No access token returned on refresh");

      setTokens(newAccess, refreshToken);

      originalRequest.headers = originalRequest.headers ?? {};
      (originalRequest.headers as any).Authorization = `Bearer ${newAccess}`;

      return axiosClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
export { API_BASE_URL };

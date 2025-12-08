// src/context/AuthProvider.jsx
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import axiosClient, { API_BASE_URL } from "../api/axiosClient";
import { AuthContext } from "./authContext";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../auth/tokenStorage";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const loadCurrentUser = useCallback(async () => {
    try {
      const resp = await axiosClient.get("/accounts/me/");
      setUser(resp.data.user);
      setEmployee(resp.data.employee);
      setShop(resp.data.shop);
    } catch {
      // token invalid, clear and stay unauthenticated
      clearTokens();
      setUser(null);
      setEmployee(null);
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (!access || !refresh) {
      setLoading(false);
      return;
    }
    loadCurrentUser();
  }, [loadCurrentUser]);

  async function login(username, password) {
    const tokenResp = await axios.post(`${API_BASE_URL}/accounts/token/`, {
      username,
      password,
    });

    const { access, refresh } = tokenResp.data;
    setTokens(access, refresh);

    const meResp = await axiosClient.get("/accounts/me/");
    setUser(meResp.data.user);
    setEmployee(meResp.data.employee);
    setShop(meResp.data.shop);
  }

  function logout() {
    clearTokens();
    setUser(null);
    setEmployee(null);
    setShop(null);
  }

  const value = {
    user,
    employee,
    shop,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

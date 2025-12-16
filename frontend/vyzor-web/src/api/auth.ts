import axiosClient from "./axiosClient";
import { setTokens, clearTokens } from "../auth/tokenStorage";

export async function login(username: string, password: string) {
  const res = await axiosClient.post("/accounts/token/", { username, password });
  const { access, refresh } = res.data as { access: string; refresh: string };
  setTokens(access, refresh);
  return res.data;
}

export async function logout() {
  clearTokens();
}

export async function getMe() {
  const res = await axiosClient.get("/accounts/me/");
  return res.data;
}

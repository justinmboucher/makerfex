import React, { useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import { getAccessToken } from "../auth/tokenStorage";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // IMPORTANT: initialize synchronously so page refresh doesn't redirect to /login
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAccessToken());

  const value = useMemo(() => ({ isAuthenticated, setIsAuthenticated }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

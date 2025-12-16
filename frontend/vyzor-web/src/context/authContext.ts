import { createContext } from "react";

export type AuthContextValue = {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
};

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const auth = useAuth();

  // Treat "no auth object yet" as loading
  const isLoading =
    auth == null ||
    auth.isLoading === true ||
    auth.loading === true ||
    auth.checkingAuth === true ||
    auth.initializing === true;

  // Consider any of these as a sign of life
  const isAuthenticated = !!(
    auth &&
    (auth.isAuthenticated === true ||
      auth.user ||
      auth.accessToken ||
      (auth.tokens && auth.tokens.access))
  );

  console.debug("ProtectedRoute state:", {
    isLoading,
    isAuthenticated,
    hasUser: !!auth?.user,
  });

  if (isLoading) {
    return (
      <div
        style={{
          padding: "2rem",
          color: "#64748b",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        Checking authentication…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}

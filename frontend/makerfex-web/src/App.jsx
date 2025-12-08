// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/authContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Projects from "./pages/Projects";

function Layout() {
  const { logout } = useAuth();

  return (
    <div>
      <header
        style={{
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Link to="/dashboard" style={{ marginRight: "1rem" }}>
            Dashboard
          </Link>
          <Link to="/customers" style={{ marginRight: "1rem" }}>
            Customers
          </Link>
          <Link to="/projects">Projects</Link>
        </div>
        <button
          onClick={logout}
          style={{
            border: "none",
            background: "#ef4444",
            color: "white",
            borderRadius: "999px",
            padding: "0.3rem 0.75rem",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>
      <main>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/projects" element={<Projects />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default function AppRoot() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}

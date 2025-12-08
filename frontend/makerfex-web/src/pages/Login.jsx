// src/pages/Login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form.username, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#e5e7eb",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "360px",
          padding: "2rem",
          borderRadius: "0.75rem",
          background: "#020617",
          boxShadow: "0 25px 50px -12px rgba(15,23,42,0.75)",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Makerfex</h1>
        <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
          Sign in to your workshop.
        </p>

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              background: "rgba(248,113,113,0.1)",
              color: "#fecaca",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Username
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #1f2933",
              background: "#020617",
              color: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #1f2933",
              background: "#020617",
              color: "inherit",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "999px",
            border: "none",
            background: submitting ? "#4b5563" : "#22c55e",
            color: "#020617",
            fontWeight: 600,
            cursor: submitting ? "default" : "pointer",
          }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#6b7280" }}>
          Demo: <strong>demouser</strong> / <strong>demo1234</strong>
        </p>
      </form>
    </div>
  );
}

// src/pages/Login.jsx
import React, { useState } from "react";
import "../styles/pages/Login.css";

import { TextField } from "../components/ui/TextField";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/authContext";
import { User, LockKeyhole } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const auth = useAuth();
  const login = auth?.login;
  const isLoading = auth?.isLoading || auth?.loading;
  const error = auth?.error;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // If user was redirected here from a protected route,
  // we’ll send them back there after login.
  const from = location.state?.from || "/dashboard";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!login) return;

    try {
      // Attempt login via AuthProvider
      await login(username, password);

      // If login throws on error, we won't reach here.
      // On success, go to prior location or dashboard.
      navigate(from, { replace: true });
    } catch (err) {
      // Optional: log for debugging; UI will show auth.error if set.
      console.error("Login failed:", err);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="mf-login-simple">
      {/* Header brand bar */}
      <header className="mf-login-simple__header">
        <div className="mf-login-simple__header-inner">
          <div className="mf-login-simple__header-brand">
            <div
              className="mf-login-simple__header-logo-mark"
              aria-hidden="true"
            >
              MF
            </div>

            <div className="mf-login-simple__header-text">
              <span className="mf-login-simple__header-name">MAKERFEX</span>
              <span className="mf-login-simple__header-tagline">
                SHOP COMMAND CENTER
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mf-login-simple__main">
        <div className="mf-login-simple__main-inner">
          <div className="mf-login-simple__container">
            {/* Left: large brand logo */}
            <div className="mf-login-simple__logo-box">
              <img
                src="/images/makerfex-logo.svg"
                alt="MAKERFEX"
                className="mf-login-simple__logo"
              />
            </div>

            {/* Right: wordmark + form */}
            <div className="mf-login-simple__form-box">
              <div>
                <h1 className="mf-login-simple__title">MAKERFEX</h1>
                <p className="mf-login-simple__subtitle">
                  SHOP COMMAND CENTER
                </p>
              </div>

              <form className="mf-login-simple__form" onSubmit={handleSubmit}>
                <TextField
                  leftIcon={<User size={18} />}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />

                <TextField
                  type="password"
                  leftIcon={<LockKeyhole size={18} />}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                {error && (
                  <div className="mf-login-simple__error">
                    {typeof error === "string" ? error : "Login failed."}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="mf-login-simple__submit"
                >
                  {isLoading ? "LOGGING IN…" : "LOGIN"}
                </Button>

                <div className="mf-login-simple__links">
                  <a href="/forgot" className="mf-login-simple__link">
                    Forgot Username/Password
                  </a>
                  <span className="mf-login-simple__divider">|</span>
                  <a href="/register" className="mf-login-simple__link">
                    Register your Account
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mf-login-simple__footer">
        <div className="mf-login-simple__footer-inner">
          <span className="mf-login-simple__footer-text">
            © {currentYear} MAKERFEX · All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

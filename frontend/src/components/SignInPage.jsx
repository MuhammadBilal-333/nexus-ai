import { useState } from "react";
import axios from "axios";
import { createLocalSession } from "../utils/clinicalFallback";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SignInPage({ onNavigate, onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/signin`, {
        email: email.trim(),
        password: password,
      });
      const { access_token, user, tenant } = res.data;
      onAuthSuccess({ token: access_token, user, tenant });
    } catch (err) {
      // If backend is unreachable (network error), fall back to local session
      if (!err.response) {
        const localSession = createLocalSession(email.split("@")[0], "My Clinic");
        onAuthSuccess(localSession);
        return;
      }
      const detail = err.response?.data?.detail || "Invalid email or password. Please try again.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const localSession = createLocalSession("Dr. Clinician", "Apex Health Clinic");
    onAuthSuccess(localSession);
  };

  return (
    <div className="auth-page-root">
      <div className="auth-nav-top">
        <button className="auth-back-btn" onClick={() => onNavigate("LANDING")}>
          ← Back to Home
        </button>
        <span className="auth-brand-logo">Nexus AI</span>
      </div>

      <div className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Sign In to Your Clinic</h2>
            <p className="auth-subtitle">
              Access your organization's dengue screening workspace and patient records.
            </p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-group">
              <label>Work Email</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="doctor@apexhospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                disabled={loading}
              />
            </div>

            <div className="auth-group">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          {/* Demo / offline access */}
          <div style={{ textAlign: "center", margin: "16px 0 4px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>— or —</span>
          </div>
          <button
            className="auth-submit-btn"
            style={{ background: "var(--card-border)", color: "var(--text-primary)", marginTop: 0 }}
            onClick={handleDemoLogin}
          >
            🧪 Try Demo Mode (No Account Needed)
          </button>

          <div className="auth-footer-prompt">
            <span>Don't have an account?</span>
            <button className="auth-switch-link" onClick={() => onNavigate("SIGN_UP")}>
              Sign Up &amp; Create Clinic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

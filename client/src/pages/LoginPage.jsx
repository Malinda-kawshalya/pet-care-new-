import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleAlert, LogIn, PawPrint, RotateCcw, ShieldCheck } from "lucide-react";
import api from "../services/api.js";
import { getDashboardPath } from "../utils/roleHelper.js";

const demoAccounts = [
  { role: "petOwner", email: "owner@demo.com", label: "Pet Owner" },
  { role: "veterinarian", email: "vet@demo.com", label: "Veterinarian" },
  { role: "petShop", email: "shop@demo.com", label: "Pet Shop" },
  { role: "groomer", email: "groomer@demo.com", label: "Groomer" },
  { role: "admin", email: "admin@demo.com", label: "Admin" }
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [reset, setReset] = useState({ email: "", token: "", password: "" });
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function runAction(action) {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      setStatus(await action());
    } catch (actionError) {
      setError(actionError.response?.data?.message || actionError.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin(event, credentials = form) {
    event?.preventDefault?.();
    let redirectRole = null;
    await runAction(async () => {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("petcare_token", data.token);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      redirectRole = data.user.role;
      return "Welcome back";
    });

    if (redirectRole) {
      window.location.assign(getDashboardPath(redirectRole));
    }
  }

  async function submitForgot(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.post("/auth/forgot-password", { email: reset.email });
      setReset((current) => ({ ...current, token: data.resetToken || current.token }));
      return data.resetToken ? `Reset token: ${data.resetToken}` : data.message;
    });
  }

  async function submitReset(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.post("/auth/reset-password", {
        token: reset.token,
        password: reset.password
      });
      setReset({ email: "", token: "", password: "" });
      setShowReset(false);
      return data.message;
    });
  }

  return (
    <section className="auth-portal full-screen-section">
      <div className="auth-portal-bg" aria-hidden="true">
        <span className="orb orb-a"></span>
        <span className="orb orb-b"></span>
        <span className="orb orb-c"></span>
      </div>

      <div className="auth-portal-grid">
        <article className="auth-hero-panel">
          <div className="brand auth-brand">
            <span className="brand-mark"><PawPrint size={18} /></span>
            <span>Pet Care</span>
          </div>
          <p className="eyebrow">Account access</p>
          <h1>Welcome back</h1>
          <p>
            Login to your role-based workspace and continue managing pets, services,
            bookings, products, and admin operations.
          </p>
          <div className="auth-hero-tags">
            <span><ShieldCheck size={14} /> JWT protected</span>
            <span><ArrowRight size={14} /> Fast role redirects</span>
            <span><LogIn size={14} /> One-click demo login</span>
          </div>
        </article>

        <article className="auth-form-panel">
          <header className="auth-panel-head">
            <h2>Login</h2>
            <p>Use your email and password to sign in.</p>
          </header>

          {status && <div className="form-alert success">{status}</div>}
          {error && <div className="form-alert error"><CircleAlert size={17} /> {error}</div>}

          <form className="auth-form" onSubmit={submitLogin}>
            <label>Email address
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>
            <label>Password
              <input
                required
                minLength="6"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </label>
            <button className="primary-button" disabled={loading} type="submit">
              <LogIn size={17} /> Login
            </button>
          </form>

          <div className="auth-inline-links">
            <button type="button" className="ghost-link" onClick={() => setShowReset((current) => !current)}>
              <RotateCcw size={15} /> {showReset ? "Hide password reset" : "Forgot password?"}
            </button>
            <Link to="/register" className="ghost-link">
              Create account <ArrowRight size={15} />
            </Link>
          </div>

          {showReset && (
            <div className="auth-reset-box">
              <form className="auth-form split-fields" onSubmit={submitForgot}>
                <label>Email for reset token
                  <input
                    required
                    type="email"
                    value={reset.email}
                    onChange={(event) => setReset({ ...reset, email: event.target.value })}
                  />
                </label>
                <button className="ghost-button" disabled={loading} type="submit">Generate token</button>
              </form>

              <form className="auth-form" onSubmit={submitReset}>
                <label>Reset token
                  <input
                    required
                    value={reset.token}
                    onChange={(event) => setReset({ ...reset, token: event.target.value })}
                  />
                </label>
                <label>New password
                  <input
                    required
                    minLength="6"
                    type="password"
                    value={reset.password}
                    onChange={(event) => setReset({ ...reset, password: event.target.value })}
                  />
                </label>
                <button className="primary-button compact" disabled={loading} type="submit">Set new password</button>
              </form>
            </div>
          )}

          <section className="demo-login-section">
            <p className="eyebrow demo-eyebrow">Demo accounts</p>
            <div className="demo-buttons">
              {demoAccounts.map(({ role, email, label }) => (
                <button
                  key={role}
                  type="button"
                  className="demo-button"
                  onClick={() => submitLogin(null, { email, password: "demo123" })}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}

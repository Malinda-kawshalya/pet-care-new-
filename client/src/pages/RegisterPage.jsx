import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleAlert, Eye, EyeOff, PawPrint, ShieldCheck, UserPlus } from "lucide-react";
import api from "../services/api.js";
import { getDashboardPath } from "../utils/roleHelper.js";
import { roles } from "../data/platformData.js";

const signupRoles = roles.filter((role) => role.id !== "admin");

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  bio: "",
  role: "petOwner",
  password: "",
  confirmPassword: "",
  businessName: "",
  licenseNumber: "",
  serviceArea: "",
  specialties: ""
};

export default function RegisterPage() {
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submitRegister(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");

    try {
      const { data } = await api.post("/auth/register", toPayload(form));
      localStorage.setItem("petcare_token", data.token);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setStatus(data.message || "Account created successfully");
      window.location.assign(getDashboardPath(data.user.role));
    } catch (registerError) {
      setError(registerError.response?.data?.message || registerError.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-portal auth-register full-screen-section">
      <div className="auth-portal-bg" aria-hidden="true">
        <span className="orb orb-a"></span>
        <span className="orb orb-b"></span>
        <span className="orb orb-c"></span>
      </div>

      <div className="auth-portal-grid register-grid">
        <article className="auth-form-panel">
          <header className="auth-panel-head">
            <h2>Create account</h2>
            <p>Register as a pet owner, veterinarian, pet shop, or groomer.</p>
          </header>

          {status && <div className="form-alert success">{status}</div>}
          {error && <div className="form-alert error"><CircleAlert size={17} /> {error}</div>}

          <form className="auth-form" onSubmit={submitRegister}>
            <div className="split-fields">
              <label>Full name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label>Email address
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </label>
            </div>

            <div className="split-fields">
              <label>Phone
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </label>
              <label>Address
                <input
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                />
              </label>
            </div>

            <label>Account type
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                {signupRoles.map((role) => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            </label>

            {isProviderRole(form.role) && (
              <div className="split-fields">
                <label>Business name
                  <input
                    value={form.businessName}
                    onChange={(event) => setForm({ ...form, businessName: event.target.value })}
                  />
                </label>
                <label>License number
                  <input
                    value={form.licenseNumber}
                    onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })}
                  />
                </label>
                <label>Service area
                  <input
                    value={form.serviceArea}
                    onChange={(event) => setForm({ ...form, serviceArea: event.target.value })}
                  />
                </label>
                <label>Specialties
                  <input
                    value={form.specialties}
                    onChange={(event) => setForm({ ...form, specialties: event.target.value })}
                  />
                </label>
              </div>
            )}

            <label>Bio
              <textarea
                value={form.bio}
                onChange={(event) => setForm({ ...form, bio: event.target.value })}
              />
            </label>

            <label>Password
              <div className="password-input-group">
                <input
                  required
                  minLength="6"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label>Confirm Password
              <div className="password-input-group">
                <input
                  required
                  minLength="6"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  title={showConfirm ? "Hide password" : "Show password"}
                  tabIndex="-1"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button className="primary-button" disabled={loading} type="submit">
              <UserPlus size={17} /> Create account
            </button>
          </form>

          <div className="auth-inline-links">
            <Link to="/login" className="ghost-link">Already have an account? Login <ArrowRight size={15} /></Link>
          </div>
        </article>

        <article className="auth-hero-panel">
          <div className="brand auth-brand">
            <span className="brand-mark"><PawPrint size={18} /></span>
            <span>Pet Care</span>
          </div>
          <p className="eyebrow">New account</p>
          <h1>Join the platform</h1>
          <p>
            Create your account and get access to the role that matches your workflow.
          </p>
          <div className="auth-hero-tags">
            <span><ShieldCheck size={14} /> Secure authentication</span>
            <span><ArrowRight size={14} /> Owner and provider access</span>
            <span><UserPlus size={14} /> Fast onboarding</span>
          </div>
        </article>
      </div>
    </section>
  );
}

function toPayload(form) {
  const providerProfile = isProviderRole(form.role)
    ? {
        businessName: form.businessName,
        licenseNumber: form.licenseNumber,
        serviceArea: form.serviceArea,
        specialties: form.specialties
      }
    : undefined;

  return {
    name: form.name,
    email: form.email,
    password: form.password,
    phone: form.phone,
    address: form.address,
    bio: form.bio,
    role: form.role,
    ...(providerProfile ? { providerProfile } : {})
  };
}

function isProviderRole(role) {
  return ["veterinarian", "petShop", "groomer"].includes(role);
}
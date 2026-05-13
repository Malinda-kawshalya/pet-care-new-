import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CircleAlert,
  KeyRound,
  LockKeyhole,
  LogIn,
  LogOut,
  MailCheck,
  PawPrint,
  RotateCcw,
  Save,
  ShieldCheck,
  UserCog,
  UserPlus
} from "lucide-react";
import api from "../services/api.js";
import { roles } from "../data/platformData.js";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  bio: "",
  role: "petOwner",
  password: "",
  businessName: "",
  licenseNumber: "",
  serviceArea: "",
  specialties: ""
};

export default function AuthPage() {
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState(emptyProfile);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [resetForm, setResetForm] = useState({ email: "", token: "", password: "" });
  const [verifyToken, setVerifyToken] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isProvider = useMemo(() => ["veterinarian", "petShop", "groomer"].includes(form.role), [form.role]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const token = localStorage.getItem("petcare_token");
    if (!token) return;
    try {
      const { data } = await api.get("/auth/me");
      setProfile(data.user);
      setProfileForm(toProfileForm(data.user));
      setMode("profile");
    } catch (_error) {
      localStorage.removeItem("petcare_token");
    }
  }

  async function submitRegister(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.post("/auth/register", toPayload(form));
      localStorage.setItem("petcare_token", data.token);
      setProfile(data.user);
      setProfileForm(toProfileForm(data.user));
      setVerifyToken(data.verificationToken || "");
      setMode("profile");
      return data.message || "Account created successfully";
    });
  }

  async function submitLogin(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.post("/auth/login", loginForm);
      localStorage.setItem("petcare_token", data.token);
      setProfile(data.user);
      setProfileForm(toProfileForm(data.user));
      setMode("profile");
      return "Welcome back";
    });
  }

  async function submitProfile(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.put("/auth/profile", toPayload(profileForm, false));
      setProfile(data.user);
      setProfileForm(toProfileForm(data.user));
      return "Profile updated";
    });
  }

  async function submitPassword(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.put("/auth/change-password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      return data.message;
    });
  }

  async function submitForgot(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.post("/auth/forgot-password", { email: resetForm.email });
      setResetForm((current) => ({ ...current, token: data.resetToken || current.token }));
      return data.resetToken ? `Reset token generated: ${data.resetToken}` : data.message;
    });
  }

  async function submitReset(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.post("/auth/reset-password", {
        token: resetForm.token,
        password: resetForm.password
      });
      setResetForm({ email: "", token: "", password: "" });
      setMode("login");
      return data.message;
    });
  }

  async function submitVerify(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.post("/auth/verify-email", { token: verifyToken });
      setProfile(data.user);
      setProfileForm(toProfileForm(data.user));
      return data.message;
    });
  }

  async function resendVerification() {
    await runAction(async () => {
      const { data } = await api.post("/auth/resend-verification");
      setVerifyToken(data.verificationToken || "");
      return data.verificationToken ? `Verification token generated: ${data.verificationToken}` : data.message;
    });
  }

  function logout() {
    localStorage.removeItem("petcare_token");
    setProfile(null);
    setMode("login");
    setStatus("Logged out");
  }

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

  return (
    <section className="auth-page account-page full-screen-section">
      <div className="auth-card account-card">
        <div className="brand auth-brand">
          <span className="brand-mark"><PawPrint size={18} /></span>
          <span>Pet Care</span>
        </div>

        <div className="account-tabs" role="tablist" aria-label="Account sections">
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">
            <UserPlus size={16} /> Register
          </button>
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
            <LogIn size={16} /> Login
          </button>
          <button className={mode === "forgot" ? "active" : ""} onClick={() => setMode("forgot")} type="button">
            <RotateCcw size={16} /> Reset
          </button>
          <button className={mode === "profile" ? "active" : ""} onClick={() => setMode("profile")} type="button">
            <UserCog size={16} /> Profile
          </button>
        </div>

        {status && <div className="form-alert success"><BadgeCheck size={17} /> {status}</div>}
        {error && <div className="form-alert error"><CircleAlert size={17} /> {error}</div>}

        {mode === "register" && (
          <>
            <p className="eyebrow">Account management</p>
            <h1>Create your account</h1>
            <p>Owners start immediately. Vets, shops, and groomers enter an admin approval queue.</p>
            <form className="auth-form account-form" onSubmit={submitRegister}>
              <AccountFields form={form} setForm={setForm} includePassword />
              {isProvider && <ProviderFields form={form} setForm={setForm} />}
              <button className="primary-button" disabled={loading} type="submit"><UserPlus size={17} /> Register</button>
            </form>
          </>
        )}

        {mode === "login" && (
          <>
            <p className="eyebrow">Secure access</p>
            <h1>Welcome back</h1>
            <p>Login with your email and password to manage your account workspace.</p>
            <form className="auth-form account-form" onSubmit={submitLogin}>
              <label>Email address<input required type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} /></label>
              <label>Password<input required type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} /></label>
              <button className="primary-button" disabled={loading} type="submit"><LogIn size={17} /> Login</button>
            </form>
            
            {/* Demo Login Options */}
            <div className="demo-login-section">
              <p className="eyebrow demo-eyebrow">Try demo accounts</p>
              <div className="demo-buttons">
                {[
                  { role: "petOwner", email: "owner@demo.com", label: "Pet Owner" },
                  { role: "veterinarian", email: "vet@demo.com", label: "Veterinarian" },
                  { role: "petShop", email: "shop@demo.com", label: "Pet Shop" },
                  { role: "groomer", email: "groomer@demo.com", label: "Groomer" },
                  { role: "admin", email: "admin@demo.com", label: "Admin" }
                ].map(({ role, email, label }) => (
                  <button
                    key={role}
                    type="button"
                    className="demo-button"
                    onClick={async () => {
                      setLoginForm({ email, password: "demo123" });
                      await new Promise(resolve => setTimeout(resolve, 100));
                      await submitLogin({ preventDefault: () => {} });
                    }}
                    title={`Login as ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === "forgot" && (
          <>
            <p className="eyebrow">Password recovery</p>
            <h1>Reset password</h1>
            <p>Generate a reset token, then set a new password with that token.</p>
            <form className="auth-form account-form split-fields" onSubmit={submitForgot}>
              <label>Email address<input required type="email" value={resetForm.email} onChange={(event) => setResetForm({ ...resetForm, email: event.target.value })} /></label>
              <button className="ghost-button" disabled={loading} type="submit"><RotateCcw size={17} /> Generate token</button>
            </form>
            <form className="auth-form account-form" onSubmit={submitReset}>
              <label>Reset token<input required value={resetForm.token} onChange={(event) => setResetForm({ ...resetForm, token: event.target.value })} /></label>
              <label>New password<input required minLength="6" type="password" value={resetForm.password} onChange={(event) => setResetForm({ ...resetForm, password: event.target.value })} /></label>
              <button className="primary-button" disabled={loading} type="submit"><KeyRound size={17} /> Set password</button>
            </form>
          </>
        )}

        {mode === "profile" && (
          <ProfilePanel
            loading={loading}
            logout={logout}
            passwordForm={passwordForm}
            profile={profile}
            profileForm={profileForm}
            resendVerification={resendVerification}
            setPasswordForm={setPasswordForm}
            setProfileForm={setProfileForm}
            setVerifyToken={setVerifyToken}
            submitPassword={submitPassword}
            submitProfile={submitProfile}
            submitVerify={submitVerify}
            verifyToken={verifyToken}
          />
        )}
      </div>

      <aside className="auth-side account-side">
        <h2>User account system</h2>
        {[
          ["Email verification", "Token-based verification flow with resend support.", MailCheck],
          ["Forgot password", "Generate reset tokens and securely save a new password.", LockKeyhole],
          ["Admin approval", "Providers stay pending until admin review.", ShieldCheck],
          ["Profile management", "Update contact, address, business, and specialty details.", UserCog]
        ].map(([title, detail, Icon]) => (
          <article key={title}>
            <Icon size={20} />
            <div>
              <strong>{title}</strong>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </aside>
    </section>
  );
}

function ProfilePanel({
  loading,
  logout,
  passwordForm,
  profile,
  profileForm,
  resendVerification,
  setPasswordForm,
  setProfileForm,
  setVerifyToken,
  submitPassword,
  submitProfile,
  submitVerify,
  verifyToken
}) {
  if (!profile) {
    return (
      <div className="empty-state">
        <UserCog size={28} />
        <h1>Login required</h1>
        <p>Sign in or register first to manage your profile.</p>
      </div>
    );
  }

  return (
    <>
      <div className="profile-summary">
        <span>{profile.name?.charAt(0)?.toUpperCase() || "U"}</span>
        <div>
          <p className="eyebrow">{roleLabel(profile.role)} | {profile.approvalStatus}</p>
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
        </div>
        <button className="ghost-button" type="button" onClick={logout}><LogOut size={17} /> Logout</button>
      </div>

      <form className="auth-form account-form" onSubmit={submitProfile}>
        <AccountFields form={profileForm} setForm={setProfileForm} lockEmail />
        {["veterinarian", "petShop", "groomer"].includes(profileForm.role) && <ProviderFields form={profileForm} setForm={setProfileForm} />}
        <button className="primary-button" disabled={loading} type="submit"><Save size={17} /> Save profile</button>
      </form>

      <div className="account-two-column">
        <form className="auth-form account-form mini-form" onSubmit={submitPassword}>
          <h3>Change password</h3>
          <label>Current password<input required type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label>
          <label>New password<input required minLength="6" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label>
          <button className="ghost-button" disabled={loading} type="submit"><KeyRound size={17} /> Update password</button>
        </form>

        <form className="auth-form account-form mini-form" onSubmit={submitVerify}>
          <h3>Email verification</h3>
          <p className={profile.isEmailVerified ? "verified-note" : "pending-note"}>
            {profile.isEmailVerified ? "Verified" : "Verification pending"}
          </p>
          <label>Verification token<input value={verifyToken} onChange={(event) => setVerifyToken(event.target.value)} /></label>
          <div className="inline-actions">
            <button className="ghost-button" disabled={loading} type="button" onClick={resendVerification}>Resend</button>
            <button className="primary-button compact" disabled={loading || profile.isEmailVerified} type="submit"><MailCheck size={17} /> Verify</button>
          </div>
        </form>
      </div>
    </>
  );
}

function AccountFields({ form, setForm, includePassword = false, lockEmail = false }) {
  return (
    <>
      <div className="split-fields">
        <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Email address<input required disabled={lockEmail} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      </div>
      <div className="split-fields">
        <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        <label>Role
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
          </select>
        </label>
      </div>
      <label>Address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
      <label>Bio<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
      {includePassword && <label>Password<input required minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>}
    </>
  );
}

function ProviderFields({ form, setForm }) {
  return (
    <div className="provider-fields">
      <label>Business name<input value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} /></label>
      <label>License number<input value={form.licenseNumber} onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })} /></label>
      <label>Service area<input value={form.serviceArea} onChange={(event) => setForm({ ...form, serviceArea: event.target.value })} /></label>
      <label>Specialties<input value={form.specialties} onChange={(event) => setForm({ ...form, specialties: event.target.value })} placeholder="Vaccines, grooming, nutrition" /></label>
    </div>
  );
}

function toPayload(form, includePassword = true) {
  const payload = {
    name: form.name,
    email: form.email,
    phone: form.phone,
    address: form.address,
    bio: form.bio,
    role: form.role,
    providerProfile: {
      businessName: form.businessName,
      licenseNumber: form.licenseNumber,
      serviceArea: form.serviceArea,
      specialties: form.specialties ? form.specialties.split(",").map((item) => item.trim()).filter(Boolean) : []
    }
  };
  if (includePassword) payload.password = form.password;
  return payload;
}

function toProfileForm(user) {
  return {
    ...emptyProfile,
    ...user,
    businessName: user.providerProfile?.businessName || "",
    licenseNumber: user.providerProfile?.licenseNumber || "",
    serviceArea: user.providerProfile?.serviceArea || "",
    specialties: user.providerProfile?.specialties?.join(", ") || ""
  };
}

function roleLabel(roleId) {
  return roles.find((role) => role.id === roleId)?.label || roleId;
}

import { useEffect, useMemo, useState } from "react";
import { CircleAlert, KeyRound, LogOut, PawPrint, Save, UserCog } from "lucide-react";
import api from "../services/api.js";
import { roles } from "../data/platformData.js";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  bio: "",
  role: "petOwner",
  businessName: "",
  licenseNumber: "",
  serviceArea: "",
  specialties: ""
};

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isProvider = useMemo(
    () => ["veterinarian", "petShop", "groomer"].includes(profileForm.role),
    [profileForm.role]
  );

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
    } catch (_error) {
      localStorage.removeItem("petcare_token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
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

  async function submitProfile(event) {
    event.preventDefault();
    await runAction(async () => {
      const { data } = await api.put("/auth/profile", toPayload(profileForm));
      setProfile(data.user);
      setProfileForm(toProfileForm(data.user));
      localStorage.setItem("user", JSON.stringify(data.user));
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

  function logout() {
    localStorage.removeItem("petcare_token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.assign("/login");
  }

  if (!profile) {
    return (
      <section className="section">
        <div className="empty-state">
          <UserCog size={28} />
          <h1>Login required</h1>
          <p>Sign in first to manage your account profile.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section account-shell">
      <div className="account-header">
        <div className="brand auth-brand">
          <span className="brand-mark"><PawPrint size={18} /></span>
          <span>Pet Care</span>
        </div>
      </div>

      {status && <div className="form-alert success">{status}</div>}
      {error && <div className="form-alert error"><CircleAlert size={17} /> {error}</div>}

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
        <div className="split-fields">
          <label>Full name
            <input required value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} />
          </label>
          <label>Email address
            <input disabled type="email" value={profileForm.email} />
          </label>
        </div>

        <div className="split-fields">
          <label>Phone
            <input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} />
          </label>
          <label>Role
            <select value={profileForm.role} onChange={(event) => setProfileForm({ ...profileForm, role: event.target.value })}>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label>Address
          <input value={profileForm.address} onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })} />
        </label>

        <label>Bio
          <textarea value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} />
        </label>

        {isProvider && (
          <div className="provider-fields">
            <label>Business name
              <input value={profileForm.businessName} onChange={(event) => setProfileForm({ ...profileForm, businessName: event.target.value })} />
            </label>
            <label>License number
              <input value={profileForm.licenseNumber} onChange={(event) => setProfileForm({ ...profileForm, licenseNumber: event.target.value })} />
            </label>
            <label>Service area
              <input value={profileForm.serviceArea} onChange={(event) => setProfileForm({ ...profileForm, serviceArea: event.target.value })} />
            </label>
            <label>Specialties
              <input value={profileForm.specialties} onChange={(event) => setProfileForm({ ...profileForm, specialties: event.target.value })} />
            </label>
          </div>
        )}

        <button className="primary-button" disabled={loading} type="submit"><Save size={17} /> Save profile</button>
      </form>

      <div className="account-two-column">
        <form className="auth-form account-form mini-form" onSubmit={submitPassword}>
          <h3>Change password</h3>
          <label>Current password
            <input required type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />
          </label>
          <label>New password
            <input required minLength="6" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
          </label>
          <button className="ghost-button" disabled={loading} type="submit"><KeyRound size={17} /> Update password</button>
        </form>
      </div>
    </section>
  );
}

function toPayload(form) {
  return {
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

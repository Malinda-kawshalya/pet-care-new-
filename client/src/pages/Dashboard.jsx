import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Ban,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Download,
  Edit3,
  Plus,
  Save,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users
} from "lucide-react";
import api from "../services/api.js";
import { roles } from "../data/platformData.js";

const emptyUser = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  bio: "",
  role: "petOwner",
  approvalStatus: "approved",
  isEmailVerified: true,
  businessName: "",
  licenseNumber: "",
  serviceArea: "",
  specialties: ""
};

const approvalStatuses = ["pending", "approved", "blocked"];

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({ search: "", role: "", approvalStatus: "" });
  const [form, setForm] = useState(emptyUser);
  const [editingId, setEditingId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredSummary = useMemo(() => {
    const pending = users.filter((user) => user.approvalStatus === "pending").length;
    const approved = users.filter((user) => user.approvalStatus === "approved").length;
    const blocked = users.filter((user) => user.approvalStatus === "blocked").length;
    const providers = users.filter((user) => ["veterinarian", "petShop", "groomer"].includes(user.role)).length;
    return { pending, approved, blocked, providers };
  }, [users]);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData(nextFilters = filters) {
    setLoading(true);
    setError("");
    try {
      const [usersResponse, analyticsResponse] = await Promise.all([
        api.get("/admin/users", { params: nextFilters }),
        api.get("/admin/analytics")
      ]);
      setUsers(usersResponse.data.users);
      setAnalytics(analyticsResponse.data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Login as an admin to manage users.");
    } finally {
      setLoading(false);
    }
  }

  function updateFilters(nextFilters) {
    setFilters(nextFilters);
    loadAdminData(nextFilters);
  }

  async function saveUser(event) {
    event.preventDefault();
    await runAction(async () => {
      if (editingId) {
        await api.put(`/admin/users/${editingId}`, toPayload(form, false));
      } else {
        await api.post("/admin/users", toPayload(form, true));
      }
      resetForm();
      await loadAdminData();
      return editingId ? "User updated" : "User created";
    });
  }

  async function setApproval(user, approvalStatus) {
    await runAction(async () => {
      await api.patch(`/admin/users/${user._id || user.id}/approval`, { approvalStatus });
      await loadAdminData();
      return `Account ${approvalStatus}`;
    });
  }

  async function setRole(user, role) {
    await runAction(async () => {
      await api.patch(`/admin/users/${user._id || user.id}/role`, { role });
      await loadAdminData();
      return "Role updated";
    });
  }

  async function deleteUser(user) {
    const confirmed = window.confirm(`Delete ${user.name}? This cannot be undone.`);
    if (!confirmed) return;
    await runAction(async () => {
      await api.delete(`/admin/users/${user._id || user.id}`);
      await loadAdminData();
      return "User deleted";
    });
  }

  function editUser(user) {
    setEditingId(user._id || user.id);
    setForm(toForm(user));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyUser);
  }

  async function runAction(action) {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      setStatus(await action());
    } catch (actionError) {
      setError(actionError.response?.data?.message || actionError.message || "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-page admin-page full-screen-section">
      <div className="dashboard-hero admin-hero">
        <div>
          <p className="eyebrow">Admin account management</p>
          <h1>User control center</h1>
          <p>Manage registrations, login eligibility, email verification, approvals, profiles, passwords, and role access for every account type.</p>
        </div>
        <div className="dashboard-actions">
          <button className="primary-button compact" onClick={resetForm} type="button"><Plus size={17} /> New user</button>
          <button className="ghost-button" onClick={() => loadAdminData()} type="button"><Search size={17} /> Refresh</button>
          <button className="ghost-button" type="button"><Download size={17} /> Report</button>
        </div>
      </div>

      <div className="metric-grid wide admin-metrics">
        {[
          ["Total users", analytics?.totals?.users ?? users.length, "All registered accounts", "blue"],
          ["Pending", analytics?.totals?.pendingApprovals ?? filteredSummary.pending, "Need admin approval", "amber"],
          ["Approved", filteredSummary.approved, "Can use protected flows", "green"],
          ["Blocked", analytics?.totals?.blockedUsers ?? filteredSummary.blocked, "Restricted accounts", "red"],
          ["Providers", filteredSummary.providers, "Vets, shops, groomers", "rose"],
          ["Verified", analytics?.totals?.verifiedUsers ?? 0, "Email verified", "purple"]
        ].map(([title, value, detail, accent]) => (
          <article key={title} className={`metric-card accent-${accent}`}>
            <p>{title}</p>
            <strong>{value}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </div>

      {status && <div className="form-alert success"><BadgeCheck size={17} /> {status}</div>}
      {error && <div className="form-alert error"><CircleAlert size={17} /> {error}</div>}

      <div className="dashboard-layout admin-layout">
        <section className="workspace-panel admin-user-form">
          <div className="panel-heading">
            <h2>{editingId ? "Edit user" : "Create user"}</h2>
            {editingId && <button className="ghost-button" onClick={resetForm} type="button">Cancel</button>}
          </div>
          <form className="auth-form account-form" onSubmit={saveUser}>
            <div className="split-fields">
              <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            </div>
            <div className="split-fields">
              <label>Role
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
                </select>
              </label>
              <label>Approval
                <select value={form.approvalStatus} onChange={(event) => setForm({ ...form, approvalStatus: event.target.value })}>
                  {approvalStatuses.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
                </select>
              </label>
            </div>
            <div className="split-fields">
              <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
              <label>{editingId ? "New password" : "Password"}<input required={!editingId} minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
            </div>
            <label>Address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
            <label>Bio<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
            <label className="checkbox-row"><input type="checkbox" checked={form.isEmailVerified} onChange={(event) => setForm({ ...form, isEmailVerified: event.target.checked })} /> Email verified</label>
            {["veterinarian", "petShop", "groomer"].includes(form.role) && (
              <div className="provider-fields">
                <label>Business name<input value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} /></label>
                <label>License number<input value={form.licenseNumber} onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })} /></label>
                <label>Service area<input value={form.serviceArea} onChange={(event) => setForm({ ...form, serviceArea: event.target.value })} /></label>
                <label>Specialties<input value={form.specialties} onChange={(event) => setForm({ ...form, specialties: event.target.value })} /></label>
              </div>
            )}
            <button className="primary-button" disabled={loading} type="submit"><Save size={17} /> {editingId ? "Save changes" : "Create account"}</button>
          </form>
        </section>

        <aside className="workspace-panel">
          <div className="panel-heading">
            <h2>Admin checks</h2>
            <ShieldAlert size={20} />
          </div>
          {(analytics?.alerts || []).map((alert) => (
            <div className="admin-check" key={alert}>
              <CheckCircle2 size={18} />
              <span>{alert}</span>
            </div>
          ))}
          <div className="role-access-list admin-role-counts">
            {roles.map((role) => (
              <article key={role.id}>
                <UserCheck size={17} />
                <div>
                  <strong>{role.label}</strong>
                  <p>{analytics?.byRole?.[role.id] || users.filter((user) => user.role === role.id).length} accounts</p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <section className="workspace-panel admin-table-panel">
        <div className="panel-heading admin-filter-heading">
          <h2>Users</h2>
          <div className="admin-filters">
            <label className="search-field"><Search size={16} /><input placeholder="Search users" value={filters.search} onChange={(event) => updateFilters({ ...filters, search: event.target.value })} /></label>
            <select value={filters.role} onChange={(event) => updateFilters({ ...filters, role: event.target.value })}>
              <option value="">All roles</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
            </select>
            <select value={filters.approvalStatus} onChange={(event) => updateFilters({ ...filters, approvalStatus: event.target.value })}>
              <option value="">All statuses</option>
              {approvalStatuses.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-user-grid">
          {users.map((user) => (
            <article className="admin-user-card" key={user._id || user.id}>
              <div className="user-card-top">
                <span className="user-avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </div>
                <em className={`status-pill ${user.approvalStatus}`}>{user.approvalStatus}</em>
              </div>
              <div className="user-card-meta">
                <span><Users size={15} /> {roleLabel(user.role)}</span>
                <span>{user.isEmailVerified ? <BadgeCheck size={15} /> : <CircleAlert size={15} />} {user.isEmailVerified ? "Verified" : "Unverified"}</span>
                <span><BarChart3 size={15} /> {user.phone || "No phone"}</span>
              </div>
              <div className="user-card-controls">
                <select value={user.role} onChange={(event) => setRole(user, event.target.value)}>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
                </select>
                <button className="ghost-button icon-label" onClick={() => editUser(user)} type="button"><Edit3 size={16} /> Edit</button>
                <button className="ghost-button icon-label danger" onClick={() => deleteUser(user)} type="button"><Trash2 size={16} /> Delete</button>
              </div>
              <div className="approval-actions">
                <button className="ghost-button" disabled={user.approvalStatus === "approved"} onClick={() => setApproval(user, "approved")} type="button"><BadgeCheck size={16} /> Approve</button>
                <button className="ghost-button" disabled={user.approvalStatus === "pending"} onClick={() => setApproval(user, "pending")} type="button"><ShieldAlert size={16} /> Pending</button>
                <button className="ghost-button danger" disabled={user.approvalStatus === "blocked"} onClick={() => setApproval(user, "blocked")} type="button"><Ban size={16} /> Block</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function toPayload(form, includePassword) {
  const payload = {
    name: form.name,
    email: form.email,
    phone: form.phone,
    address: form.address,
    bio: form.bio,
    role: form.role,
    approvalStatus: form.approvalStatus,
    isEmailVerified: form.isEmailVerified,
    providerProfile: {
      businessName: form.businessName,
      licenseNumber: form.licenseNumber,
      serviceArea: form.serviceArea,
      specialties: form.specialties ? form.specialties.split(",").map((item) => item.trim()).filter(Boolean) : []
    }
  };
  if (includePassword || form.password) payload.password = form.password;
  return payload;
}

function toForm(user) {
  return {
    ...emptyUser,
    ...user,
    password: "",
    businessName: user.providerProfile?.businessName || "",
    licenseNumber: user.providerProfile?.licenseNumber || "",
    serviceArea: user.providerProfile?.serviceArea || "",
    specialties: user.providerProfile?.specialties?.join(", ") || ""
  };
}

function roleLabel(roleId) {
  return roles.find((role) => role.id === roleId)?.label || roleId;
}

function titleCase(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Calendar,
  Package,
  FileText,
  Heart,
  BarChart3,
  Check,
  Ban,
  Pencil,
  Trash2,
  Plus,
  RefreshCcw
} from "lucide-react";
import api from "../../services/api.js";
import "../../styles/admin.css";

const sections = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "users", label: "Users", icon: Users },
  { key: "appointments", label: "Appointments", icon: Calendar },
  { key: "products", label: "Products", icon: Package },
  { key: "blogs", label: "Blogs", icon: FileText },
  { key: "adoptions", label: "Adoptions", icon: Heart },
  { key: "analytics", label: "Analytics & Reports", icon: BarChart3 }
];

const defaultForms = {
  user: { name: "", email: "", password: "", role: "petOwner", approvalStatus: "approved" },
  appointment: { pet: "", owner: "", provider: "", serviceType: "vet", scheduledAt: "", status: "pending", location: "", notes: "" },
  product: { seller: "", name: "", category: "", price: "", stock: "", description: "", approvalStatus: "pending", isActive: true },
  blog: { author: "", title: "", body: "", tags: "", status: "draft" },
  adoption: { pet: "", postedBy: "", title: "", description: "", adoptionFee: "", location: "", status: "pendingApproval" }
};

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [report, setReport] = useState(null);

  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [adoptions, setAdoptions] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formType, setFormType] = useState("user");
  const [form, setForm] = useState(defaultForms.user);

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (active === "users") loadUsers();
    if (active === "appointments") loadAppointments();
    if (active === "products") loadProducts();
    if (active === "blogs") loadBlogs();
    if (active === "adoptions") loadAdoptions();
    if (active === "analytics") loadAnalyticsAndReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  async function run(action) {
    setLoading(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  }

  function flash(message) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 2500);
  }

  async function loadOverview() {
    await run(async () => {
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data);
    });
  }

  async function loadUsers() {
    await run(async () => {
      const res = await api.get("/admin/users", { params: { search } });
      setUsers(res.data.users || []);
    });
  }

  async function loadAppointments() {
    await run(async () => {
      const res = await api.get("/admin/appointments", { params: { q: search } });
      setAppointments(res.data.items || []);
    });
  }

  async function loadProducts() {
    await run(async () => {
      const res = await api.get("/admin/products", { params: { q: search } });
      setProducts(res.data.items || []);
    });
  }

  async function loadBlogs() {
    await run(async () => {
      const res = await api.get("/admin/blogs", { params: { q: search } });
      setBlogs(res.data.items || []);
    });
  }

  async function loadAdoptions() {
    await run(async () => {
      const res = await api.get("/admin/adoptions", { params: { q: search } });
      setAdoptions(res.data.items || []);
    });
  }

  async function loadAnalyticsAndReport() {
    await run(async () => {
      const [analyticsRes, reportRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/reports", { params: { type: "summary" } })
      ]);
      setAnalytics(analyticsRes.data);
      setReport(reportRes.data);
    });
  }

  const sectionData = useMemo(() => {
    return {
      users,
      appointments,
      products,
      blogs,
      adoptions
    };
  }, [users, appointments, products, blogs, adoptions]);

  function openCreate(type) {
    setFormType(type);
    setForm(defaultForms[type]);
    setEditItem(null);
    setShowCreate(true);
  }

  function openEdit(type, item) {
    setFormType(type);
    if (type === "user") {
      setForm({
        name: item.name || "",
        email: item.email || "",
        password: "",
        role: item.role || "petOwner",
        approvalStatus: item.approvalStatus || "pending"
      });
    }
    if (type === "appointment") {
      setForm({
        pet: item.pet?._id || item.pet || "",
        owner: item.owner?._id || item.owner || "",
        provider: item.provider?._id || item.provider || "",
        serviceType: item.serviceType || "vet",
        scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : "",
        status: item.status || "pending",
        location: item.location || "",
        notes: item.notes || ""
      });
    }
    if (type === "product") {
      setForm({
        seller: item.seller?._id || item.seller || "",
        name: item.name || "",
        category: item.category || "",
        price: item.price || "",
        stock: item.stock || "",
        description: item.description || "",
        approvalStatus: item.approvalStatus || "pending",
        isActive: Boolean(item.isActive)
      });
    }
    if (type === "blog") {
      setForm({
        author: item.author?._id || item.author || "",
        title: item.title || "",
        body: item.body || "",
        tags: Array.isArray(item.tags) ? item.tags.join(",") : "",
        status: item.status || "draft"
      });
    }
    if (type === "adoption") {
      setForm({
        pet: item.pet?._id || item.pet || "",
        postedBy: item.postedBy?._id || item.postedBy || "",
        title: item.title || "",
        description: item.description || "",
        adoptionFee: item.adoptionFee || "",
        location: item.location || "",
        status: item.status || "pendingApproval"
      });
    }
    setEditItem(item);
    setShowCreate(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    const isEdit = Boolean(editItem?._id);

    await run(async () => {
      if (formType === "user") {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        if (isEdit) {
          await api.put(`/admin/users/${editItem._id}`, payload);
          flash("User updated");
          await loadUsers();
        } else {
          await api.post("/admin/users", payload);
          flash("User created");
          await loadUsers();
        }
      }

      if (formType === "appointment") {
        const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
        if (isEdit) {
          await api.put(`/admin/appointments/${editItem._id}`, payload);
          flash("Appointment updated");
        } else {
          await api.post("/admin/appointments", payload);
          flash("Appointment created");
        }
        await loadAppointments();
      }

      if (formType === "product") {
        const payload = {
          ...form,
          price: Number(form.price || 0),
          stock: Number(form.stock || 0)
        };
        if (isEdit) {
          await api.put(`/admin/products/${editItem._id}`, payload);
          flash("Product updated");
        } else {
          await api.post("/admin/products", payload);
          flash("Product created");
        }
        await loadProducts();
      }

      if (formType === "blog") {
        const payload = {
          ...form,
          tags: form.tags
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        };
        if (isEdit) {
          await api.put(`/admin/blogs/${editItem._id}`, payload);
          flash("Blog updated");
        } else {
          await api.post("/admin/blogs", payload);
          flash("Blog created");
        }
        await loadBlogs();
      }

      if (formType === "adoption") {
        const payload = {
          ...form,
          adoptionFee: Number(form.adoptionFee || 0)
        };
        if (isEdit) {
          await api.put(`/admin/adoptions/${editItem._id}`, payload);
          flash("Adoption post updated");
        } else {
          await api.post("/admin/adoptions", payload);
          flash("Adoption post created");
        }
        await loadAdoptions();
      }

      setShowCreate(false);
      setEditItem(null);
    });
  }

  async function removeItem(type, id) {
    await run(async () => {
      if (type === "users") {
        await api.delete(`/admin/users/${id}`);
        await loadUsers();
      }
      if (type === "appointments") {
        await api.delete(`/admin/appointments/${id}`);
        await loadAppointments();
      }
      if (type === "products") {
        await api.delete(`/admin/products/${id}`);
        await loadProducts();
      }
      if (type === "blogs") {
        await api.delete(`/admin/blogs/${id}`);
        await loadBlogs();
      }
      if (type === "adoptions") {
        await api.delete(`/admin/adoptions/${id}`);
        await loadAdoptions();
      }
      flash("Deleted successfully");
    });
  }

  async function moderate(type, id, payload) {
    await run(async () => {
      if (type === "user") {
        await api.patch(`/admin/users/${id}/approval`, payload);
        await loadUsers();
      }
      if (type === "product") {
        await api.put(`/admin/products/${id}`, payload);
        await loadProducts();
      }
      if (type === "blog") {
        await api.put(`/admin/blogs/${id}`, payload);
        await loadBlogs();
      }
      if (type === "adoption") {
        await api.put(`/admin/adoptions/${id}`, payload);
        await loadAdoptions();
      }
      if (type === "appointment") {
        await api.put(`/admin/appointments/${id}`, payload);
        await loadAppointments();
      }
      flash("Status updated");
    });
  }

  function csvFromReport() {
    if (!report) return;
    const rows = [
      ["metric", "value"],
      ["users", report.totals.users],
      ["orders", report.totals.orders],
      ["appointments", report.totals.appointments],
      ["revenue", report.revenue]
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "platform-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="admin-shell-modern">
      <aside className="admin-sidebar-modern">
        <div className="admin-brand">
          <span className="admin-brand-dot" />
          <div>
            <h2>Control Center</h2>
            <p>Platform Administration</p>
          </div>
        </div>

        <nav className="admin-nav-modern">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`admin-nav-item ${active === item.key ? "active" : ""}`}
                onClick={() => {
                  setSearch("");
                  setActive(item.key);
                }}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="admin-main-modern">
        <header className="admin-main-header">
          <div>
            <h1>{sections.find((x) => x.key === active)?.label}</h1>
            <p>Full CRUD and moderation tools for the platform.</p>
          </div>
          <div className="admin-main-actions">
            <input
              className="admin-search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="admin-btn secondary" onClick={() => {
              if (active === "overview") loadOverview();
              if (active === "users") loadUsers();
              if (active === "appointments") loadAppointments();
              if (active === "products") loadProducts();
              if (active === "blogs") loadBlogs();
              if (active === "adoptions") loadAdoptions();
              if (active === "analytics") loadAnalyticsAndReport();
            }}>
              <RefreshCcw size={16} /> Refresh
            </button>
            {active !== "overview" && active !== "analytics" && (
              <button className="admin-btn primary" onClick={() => openCreate(active.slice(0, -1))}>
                <Plus size={16} /> New
              </button>
            )}
          </div>
        </header>

        {loading && <div className="admin-alert info">Loading...</div>}
        {error && <div className="admin-alert error">{error}</div>}
        {success && <div className="admin-alert success">{success}</div>}

        {active === "overview" && (
          <div className="admin-overview-grid">
            <Card title="Users" value={stats?.totalUsers || 0} />
            <Card title="Appointments" value={stats?.totalAppointments || 0} />
            <Card title="Products" value={stats?.totalProducts || 0} />
            <Card title="Pending Approvals" value={stats?.pendingApprovals || 0} />
            <Card title="Platform Health" value={`${stats?.platformHealth || 0}%`} />
            <Card title="Pending Adoptions" value={stats?.pendingAdoptions || 0} />

            <div className="admin-panel-card full">
              <h3>Recent Activity</h3>
              <div className="admin-list-activity">
                {(stats?.recentActivity || []).map((item, idx) => (
                  <div key={`${item.message}-${idx}`} className="activity-row">
                    <strong>{item.message}</strong>
                    <span>{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active !== "overview" && active !== "analytics" && (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  {active === "users" && (
                    <>
                      <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
                    </>
                  )}
                  {active === "appointments" && (
                    <>
                      <th>Pet</th><th>Owner</th><th>Provider</th><th>Service</th><th>Status</th><th>Actions</th>
                    </>
                  )}
                  {active === "products" && (
                    <>
                      <th>Name</th><th>Seller</th><th>Price</th><th>Approval</th><th>Active</th><th>Actions</th>
                    </>
                  )}
                  {active === "blogs" && (
                    <>
                      <th>Title</th><th>Author</th><th>Status</th><th>Created</th><th>Actions</th>
                    </>
                  )}
                  {active === "adoptions" && (
                    <>
                      <th>Title</th><th>Pet</th><th>Posted By</th><th>Status</th><th>Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(sectionData[active] || []).map((item) => (
                  <tr key={item._id}>
                    {active === "users" && (
                      <>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.role}</td>
                        <td>{item.approvalStatus}</td>
                        <td className="actions">
                          <button onClick={() => moderate("user", item._id, { approvalStatus: "approved" })}><Check size={15} /></button>
                          <button onClick={() => moderate("user", item._id, { approvalStatus: "blocked" })}><Ban size={15} /></button>
                          <button onClick={() => openEdit("user", item)}><Pencil size={15} /></button>
                          <button onClick={() => removeItem("users", item._id)}><Trash2 size={15} /></button>
                        </td>
                      </>
                    )}

                    {active === "appointments" && (
                      <>
                        <td>{item.pet?.name || "-"}</td>
                        <td>{item.owner?.name || "-"}</td>
                        <td>{item.provider?.name || "-"}</td>
                        <td>{item.serviceType}</td>
                        <td>{item.status}</td>
                        <td className="actions">
                          <button onClick={() => moderate("appointment", item._id, { status: "confirmed" })}><Check size={15} /></button>
                          <button onClick={() => moderate("appointment", item._id, { status: "cancelled" })}><Ban size={15} /></button>
                          <button onClick={() => openEdit("appointment", item)}><Pencil size={15} /></button>
                          <button onClick={() => removeItem("appointments", item._id)}><Trash2 size={15} /></button>
                        </td>
                      </>
                    )}

                    {active === "products" && (
                      <>
                        <td>{item.name}</td>
                        <td>{item.seller?.name || "-"}</td>
                        <td>${item.price}</td>
                        <td>{item.approvalStatus || "pending"}</td>
                        <td>{item.isActive ? "yes" : "no"}</td>
                        <td className="actions">
                          <button onClick={() => moderate("product", item._id, { approvalStatus: "approved", isActive: true })}><Check size={15} /></button>
                          <button onClick={() => moderate("product", item._id, { approvalStatus: "rejected", isActive: false })}><Ban size={15} /></button>
                          <button onClick={() => openEdit("product", item)}><Pencil size={15} /></button>
                          <button onClick={() => removeItem("products", item._id)}><Trash2 size={15} /></button>
                        </td>
                      </>
                    )}

                    {active === "blogs" && (
                      <>
                        <td>{item.title}</td>
                        <td>{item.author?.name || "-"}</td>
                        <td>{item.status}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="actions">
                          <button onClick={() => moderate("blog", item._id, { status: "published" })}><Check size={15} /></button>
                          <button onClick={() => moderate("blog", item._id, { status: "flagged" })}><Ban size={15} /></button>
                          <button onClick={() => openEdit("blog", item)}><Pencil size={15} /></button>
                          <button onClick={() => removeItem("blogs", item._id)}><Trash2 size={15} /></button>
                        </td>
                      </>
                    )}

                    {active === "adoptions" && (
                      <>
                        <td>{item.title}</td>
                        <td>{item.pet?.name || "-"}</td>
                        <td>{item.postedBy?.name || "-"}</td>
                        <td>{item.status}</td>
                        <td className="actions">
                          <button onClick={() => moderate("adoption", item._id, { status: "open" })}><Check size={15} /></button>
                          <button onClick={() => moderate("adoption", item._id, { status: "closed" })}><Ban size={15} /></button>
                          <button onClick={() => openEdit("adoption", item)}><Pencil size={15} /></button>
                          <button onClick={() => removeItem("adoptions", item._id)}><Trash2 size={15} /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === "analytics" && (
          <div className="admin-overview-grid">
            <div className="admin-panel-card">
              <h3>User Analytics</h3>
              {Object.entries(analytics?.byRole || {}).map(([k, v]) => (
                <p key={k} className="mini-row"><span>{k}</span><strong>{v}</strong></p>
              ))}
            </div>

            <div className="admin-panel-card">
              <h3>Approval Status</h3>
              {Object.entries(analytics?.byStatus || {}).map(([k, v]) => (
                <p key={k} className="mini-row"><span>{k}</span><strong>{v}</strong></p>
              ))}
            </div>

            <div className="admin-panel-card full">
              <h3>Reports</h3>
              <div className="report-grid">
                <p>Total Users: <strong>{report?.totals?.users || 0}</strong></p>
                <p>Total Orders: <strong>{report?.totals?.orders || 0}</strong></p>
                <p>Total Appointments: <strong>{report?.totals?.appointments || 0}</strong></p>
                <p>Revenue: <strong>${report?.revenue || 0}</strong></p>
              </div>
              <button className="admin-btn primary" onClick={csvFromReport}>Export CSV</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editItem ? "Update" : "Create"} {formType}</h3>
            <form className="admin-form-grid" onSubmit={submitForm}>
              <DynamicForm formType={formType} form={form} setForm={setForm} />
              <div className="admin-form-actions">
                <button type="button" className="admin-btn secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary">{editItem ? "Save Changes" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function Card({ title, value }) {
  return (
    <div className="admin-panel-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function DynamicForm({ formType, form, setForm }) {
  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  if (formType === "user") {
    return (
      <>
        <input name="name" value={form.name} onChange={onChange} placeholder="Name" required />
        <input name="email" value={form.email} onChange={onChange} placeholder="Email" required />
        <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Password (optional on edit)" />
        <select name="role" value={form.role} onChange={onChange}>
          <option value="petOwner">Pet Owner</option>
          <option value="veterinarian">Veterinarian</option>
          <option value="petShop">Pet Shop</option>
          <option value="groomer">Groomer</option>
          <option value="admin">Admin</option>
        </select>
        <select name="approvalStatus" value={form.approvalStatus} onChange={onChange}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="blocked">Blocked</option>
        </select>
      </>
    );
  }

  if (formType === "appointment") {
    return (
      <>
        <input name="pet" value={form.pet} onChange={onChange} placeholder="Pet ID" required />
        <input name="owner" value={form.owner} onChange={onChange} placeholder="Owner ID" required />
        <input name="provider" value={form.provider} onChange={onChange} placeholder="Provider ID" required />
        <select name="serviceType" value={form.serviceType} onChange={onChange}>
          <option value="vet">Vet</option>
          <option value="grooming">Grooming</option>
          <option value="training">Training</option>
        </select>
        <input name="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={onChange} required />
        <select name="status" value={form.status} onChange={onChange}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <input name="location" value={form.location} onChange={onChange} placeholder="Location" />
        <textarea name="notes" value={form.notes} onChange={onChange} placeholder="Notes" rows={3} />
      </>
    );
  }

  if (formType === "product") {
    return (
      <>
        <input name="seller" value={form.seller} onChange={onChange} placeholder="Seller ID" required />
        <input name="name" value={form.name} onChange={onChange} placeholder="Product Name" required />
        <input name="category" value={form.category} onChange={onChange} placeholder="Category" required />
        <input name="price" type="number" value={form.price} onChange={onChange} placeholder="Price" required />
        <input name="stock" type="number" value={form.stock} onChange={onChange} placeholder="Stock" />
        <select name="approvalStatus" value={form.approvalStatus} onChange={onChange}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <label className="checkbox-field">
          <input name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} /> Active
        </label>
        <textarea name="description" value={form.description} onChange={onChange} placeholder="Description" rows={3} />
      </>
    );
  }

  if (formType === "blog") {
    return (
      <>
        <input name="author" value={form.author} onChange={onChange} placeholder="Author ID" required />
        <input name="title" value={form.title} onChange={onChange} placeholder="Title" required />
        <input name="tags" value={form.tags} onChange={onChange} placeholder="Tags comma separated" />
        <select name="status" value={form.status} onChange={onChange}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="flagged">Flagged</option>
        </select>
        <textarea name="body" value={form.body} onChange={onChange} placeholder="Body" rows={6} required />
      </>
    );
  }

  return (
    <>
      <input name="pet" value={form.pet} onChange={onChange} placeholder="Pet ID" required />
      <input name="postedBy" value={form.postedBy} onChange={onChange} placeholder="Posted By User ID" required />
      <input name="title" value={form.title} onChange={onChange} placeholder="Title" required />
      <input name="adoptionFee" type="number" value={form.adoptionFee} onChange={onChange} placeholder="Adoption Fee" />
      <input name="location" value={form.location} onChange={onChange} placeholder="Location" />
      <select name="status" value={form.status} onChange={onChange}>
        <option value="pendingApproval">Pending Approval</option>
        <option value="open">Open</option>
        <option value="adopted">Adopted</option>
        <option value="closed">Closed</option>
      </select>
      <textarea name="description" value={form.description} onChange={onChange} placeholder="Description" rows={5} />
    </>
  );
}

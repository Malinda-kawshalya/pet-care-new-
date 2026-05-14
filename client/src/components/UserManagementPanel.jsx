import { useState, useEffect } from "react";
import { Check, X, Shield, AlertCircle, User, Mail, Phone, Calendar, Lock, Unlock, Trash2, Edit2, Save, Eye, EyeOff } from "lucide-react";
import api from "../services/api.js";

export default function UserManagementPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      const [statsRes, usersRes, approvalsRes] = await Promise.all([
        api.get("/auth/stats/users"),
        api.get("/auth/users?limit=100"),
        api.get("/auth/approvals/pending")
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setPendingApprovals(approvalsRes.data.users || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
      setLoading(false);
    }
  }

  async function updateUserStatus(userId, newStatus) {
    try {
      await api.put(`/auth/users/${userId}/approval`, { approvalStatus: newStatus });
      setSuccessMsg(`User ${newStatus} successfully!`);
      await loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setSuccessMsg("User role updated successfully!");
      setEditingId(null);
      await loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  }

  async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      setSuccessMsg("User deleted successfully!");
      await loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  }

  async function seedDemo() {
    if (!confirm("This will create demo accounts. Continue?")) return;
    try {
      const res = await api.post("/auth/seed-demo");
      setSuccessMsg(res.data.message);
      await loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to seed demo accounts");
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.approvalStatus === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading user management panel...</p>
      </div>
    );
  }

  return (
    <div className="user-management-panel">
      <div className="panel-header">
        <div>
          <h2>User Management</h2>
          <p>Manage users, roles, and approvals</p>
        </div>
        <button onClick={seedDemo} className="primary-button">
          <Shield size={16} /> Seed Demo Accounts
        </button>
      </div>

      {successMsg && (
        <div className="form-alert success">
          <Check size={17} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="form-alert error">
          <AlertCircle size={17} /> {error}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <User size={20} />
            </div>
            <div>
              <p className="stat-label">Total Users</p>
              <strong className="stat-value">{stats.totalUsers}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="stat-label">Pending Approvals</p>
              <strong className="stat-value">{stats.byApprovalStatus.pending || 0}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <Check size={20} />
            </div>
            <div>
              <p className="stat-label">Approved</p>
              <strong className="stat-value">{stats.byApprovalStatus.approved || 0}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">
              <Lock size={20} />
            </div>
            <div>
              <p className="stat-label">Blocked</p>
              <strong className="stat-value">{stats.byApprovalStatus.blocked || 0}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="pending-approvals-section">
          <h3>Pending Provider Approvals ({pendingApprovals.length})</h3>
          <div className="approvals-list">
            {pendingApprovals.map(user => (
              <div key={user.id} className="approval-card">
                <div className="approval-info">
                  <div className="approval-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h4>{user.name}</h4>
                    <p className="approval-role">{user.role} • {user.email}</p>
                    {user.businessName && (
                      <p className="approval-business">
                        <Shield size={14} /> {user.businessName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="approval-actions">
                  <button
                    onClick={() => updateUserStatus(user.id, "approved")}
                    className="action-btn approve"
                    title="Approve this provider"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => updateUserStatus(user.id, "rejected")}
                    className="action-btn reject"
                    title="Reject this provider"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Search and Filters */}
      <div className="user-filters">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="filter-select">
          <option value="all">All Roles</option>
          <option value="petOwner">Pet Owner</option>
          <option value="veterinarian">Veterinarian</option>
          <option value="petShop">Pet Shop</option>
          <option value="groomer">Groomer</option>
          <option value="admin">Admin</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="blocked">Blocked</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <User size={32} />
            <h3>No users found</h3>
            <p>Adjust your filters or search terms</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={`user-row ${user.approvalStatus}`}>
                  <td className="name-cell">
                    <div className="user-avatar-small">{user.name.charAt(0).toUpperCase()}</div>
                    <span>{user.name}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {editingId === user.id ? (
                      <select
                        value={editData.role || user.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="role-select"
                      >
                        <option value="petOwner">Pet Owner</option>
                        <option value="veterinarian">Veterinarian</option>
                        <option value="petShop">Pet Shop</option>
                        <option value="groomer">Groomer</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="role-badge">{user.role}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${user.approvalStatus}`}>
                      {user.approvalStatus}
                    </span>
                  </td>
                  <td>
                    {user.isEmailVerified ? (
                      <span className="verified-badge"><Check size={14} /> Verified</span>
                    ) : (
                      <span className="unverified-badge"><X size={14} /> Pending</span>
                    )}
                  </td>
                  <td className="date-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={() => updateUserRole(user.id, editData.role)}
                            className="action-btn small save"
                            title="Save changes"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="action-btn small cancel"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(user.id);
                              setEditData({ role: user.role });
                            }}
                            className="action-btn small edit"
                            title="Edit user"
                          >
                            <Edit2 size={14} />
                          </button>
                          {user.approvalStatus !== "blocked" ? (
                            <button
                              onClick={() => updateUserStatus(user.id, "blocked")}
                              className="action-btn small block"
                              title="Block user"
                            >
                              <Lock size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateUserStatus(user.id, "approved")}
                              className="action-btn small unblock"
                              title="Unblock user"
                            >
                              <Unlock size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="action-btn small delete"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Trash2, Check, X, Shield, AlertCircle, User, Mail, Phone, Calendar, Lock, Unlock } from 'lucide-react';
import api from '../../services/api.js';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, approvalsRes] = await Promise.all([
        api.get("/auth/stats/users"),
        api.get("/auth/users?limit=100"),
        api.get("/auth/approvals/pending")
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setPendingApprovals(approvalsRes.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveUser(userId) {
    try {
      await api.put(`/auth/users/${userId}/approval`, { approvalStatus: "approved" });
      setSuccessMsg("User approved successfully!");
      loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve user");
    }
  }

  async function handleRejectUser(userId) {
    try {
      await api.put(`/auth/users/${userId}/approval`, { approvalStatus: "rejected" });
      setSuccessMsg("User rejected successfully!");
      loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject user");
    }
  }

  async function handleBlockUser(userId) {
    try {
      await api.put(`/auth/users/${userId}/approval`, { approvalStatus: "blocked" });
      setSuccessMsg("User blocked successfully!");
      loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to block user");
    }
  }

  async function handleDeleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      setSuccessMsg("User deleted successfully!");
      loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  }

  async function seedDemoAccounts() {
    try {
      const res = await api.post("/auth/seed-demo");
      setSuccessMsg(res.data.message);
      loadDashboardData();
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

  if (loading) return <div className="admin-page dashboard-page"><p>Loading...</p></div>;

  return (
    <section className="admin-page dashboard-page">
      <div className="dashboard-hero">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, approvals, and system settings</p>
        </div>
        <button onClick={seedDemoAccounts} className="primary-button">Seed Demo Accounts</button>
      </div>

      {successMsg && <div className="form-alert success"><Check size={17} /> {successMsg}</div>}
      {error && <div className="form-alert error"><AlertCircle size={17} /> {error}</div>}

      {/* Statistics Cards */}
      {stats && (
        <div className="metric-grid wide">
          <div className="metric-card">
            <p>Total Users</p>
            <strong>{stats.totalUsers}</strong>
            <span>Active accounts</span>
          </div>
          <div className="metric-card accent-blue">
            <p>Pending Approvals</p>
            <strong>{stats.byApprovalStatus.pending || 0}</strong>
            <span>Waiting review</span>
          </div>
          <div className="metric-card accent-rose">
            <p>Blocked Accounts</p>
            <strong>{stats.byApprovalStatus.blocked || 0}</strong>
            <span>Inactive</span>
          </div>
          <div className="metric-card accent-green">
            <p>Email Verified</p>
            <strong>{stats.emailVerified || 0}</strong>
            <span>Verified users</span>
          </div>
          <div className="metric-card accent-purple">
            <p>Veterinarians</p>
            <strong>{stats.byRole.veterinarian || 0}</strong>
            <span>Service providers</span>
          </div>
          <div className="metric-card accent-amber">
            <p>Pet Owners</p>
            <strong>{stats.byRole.petOwner || 0}</strong>
            <span>Regular users</span>
          </div>
        </div>
      )}

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="admin-panel widget">
          <div className="widget-header">
            <h2>Pending Provider Approvals ({pendingApprovals.length})</h2>
          </div>
          <div className="admin-table-panel">
            {pendingApprovals.map(user => (
              <div key={user.id} className="approval-item" style={{padding: '16px', border: '1px solid var(--line)', borderRadius: '6px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h3 style={{margin: 0, fontSize: '1rem', fontWeight: 'bold'}}>{user.name}</h3>
                  <p style={{margin: '4px 0', color: 'var(--muted)', fontSize: '0.9rem'}}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.email}
                  </p>
                  {user.businessName && <p style={{margin: '4px 0', color: 'var(--muted)', fontSize: '0.9rem'}}>{user.businessName}</p>}
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button onClick={() => handleApproveUser(user.id)} className="primary-button compact" style={{background: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <Check size={16} /> Approve
                  </button>
                  <button onClick={() => handleRejectUser(user.id)} className="ghost-button" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management */}
      <div className="admin-panel">
        <div className="admin-filter-heading" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2>All Users</h2>
          <div className="admin-filters">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{minWidth: '220px'}}
            />
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="petOwner">Pet Owner</option>
              <option value="veterinarian">Veterinarian</option>
              <option value="petShop">Pet Shop</option>
              <option value="groomer">Groomer</option>
              <option value="admin">Admin</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="blocked">Blocked</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="admin-table-panel">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <User size={28} />
              <h1>No users found</h1>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid var(--line)'}}>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Name</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Email</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Role</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Status</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Joined</th>
                    <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{borderBottom: '1px solid var(--line)'}}>
                      <td style={{padding: '12px'}}>{user.name}</td>
                      <td style={{padding: '12px', fontSize: '0.9rem', color: 'var(--muted)'}}>{user.email}</td>
                      <td style={{padding: '12px'}}>
                        <span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', background: 'var(--soft)', color: 'var(--ink)'}}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td style={{padding: '12px'}}>
                        <span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', background: user.approvalStatus === 'approved' ? '#e5f6e8' : user.approvalStatus === 'blocked' ? '#ffe3e1' : '#fff2d8', color: user.approvalStatus === 'approved' ? '#176b3a' : user.approvalStatus === 'blocked' ? '#c43d35' : '#8a5a08'}}>
                          {user.approvalStatus.charAt(0).toUpperCase() + user.approvalStatus.slice(1)}
                        </span>
                      </td>
                      <td style={{padding: '12px', fontSize: '0.9rem', color: 'var(--muted)'}}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{padding: '12px', textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center'}}>
                        {user.approvalStatus === 'pending' && (
                          <>
                            <button onClick={() => handleApproveUser(user.id)} title="Approve" style={{background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                              <Check size={14} />
                            </button>
                            <button onClick={() => handleRejectUser(user.id)} title="Reject" style={{background: 'var(--line)', color: 'var(--ink)', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {user.approvalStatus !== 'blocked' && (
                          <button onClick={() => handleBlockUser(user.id)} title="Block user" style={{background: '#ffe3e1', color: 'var(--red)', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                            <Lock size={14} />
                          </button>
                        )}
                        {user.approvalStatus === 'blocked' && (
                          <button onClick={() => handleApproveUser(user.id)} title="Unblock user" style={{background: '#e5f6e8', color: 'var(--green)', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                            <Unlock size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteUser(user.id)} title="Delete user" style={{background: '#ffe3e1', color: 'var(--red)', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;

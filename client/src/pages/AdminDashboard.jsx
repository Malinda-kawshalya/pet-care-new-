import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Package,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import api from '../services/api';
import '../styles/admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    totalProducts: 0,
    pendingApprovals: 0,
    recentActivity: [],
    usersByRole: {},
    appointmentStats: {},
    platformHealth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {trend && (
          <p className="stat-trend">
            <TrendingUp size={14} />
            {trend}
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-dashboard">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="stats-grid dashboard-stats">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          trend="+5.2% this week"
          color="blue"
        />
        <StatCard
          icon={Calendar}
          label="Appointments"
          value={stats.totalAppointments}
          trend="+2.1% this week"
          color="green"
        />
        <StatCard
          icon={Package}
          label="Products"
          value={stats.totalProducts}
          trend="+8.5% this week"
          color="amber"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Approvals"
          value={stats.pendingApprovals}
          trend="Needs attention"
          color="red"
        />
      </div>

      {/* Secondary Stats */}
      <div className="dashboard-grid">
        {/* Users by Role */}
        <div className="dashboard-card">
          <h3 className="card-title">Users by Role</h3>
          <div className="role-breakdown">
            {Object.entries(stats.usersByRole || {}).map(([role, count]) => (
              <div key={role} className="role-item">
                <div className="role-label">{role}</div>
                <div className="role-bar">
                  <div
                    className="role-bar-fill"
                    style={{
                      width: `${(count / stats.totalUsers) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="role-count">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health */}
        <div className="dashboard-card">
          <h3 className="card-title">Platform Health</h3>
          <div className="health-gauge">
            <div className="health-circle">
              <div
                className="health-progress"
                style={{
                  background: `conic-gradient(
                    #2f8b45 0deg ${stats.platformHealth * 3.6}deg,
                    #e0e0e0 ${stats.platformHealth * 3.6}deg 360deg
                  )`
                }}
              >
                <div className="health-value">
                  <span className="health-percent">{stats.platformHealth}%</span>
                </div>
              </div>
            </div>
            <p className="health-status">
              {stats.platformHealth >= 80
                ? '✅ Excellent'
                : stats.platformHealth >= 60
                ? '⚠️ Good'
                : '❌ Needs Attention'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-card full-width">
          <h3 className="card-title">Quick Stats</h3>
          <div className="quick-stats">
            <div className="quick-stat-item">
              <CheckCircle className="status-icon success" size={20} />
              <div className="quick-stat-info">
                <p className="quick-stat-label">Verified Users</p>
                <p className="quick-stat-value">{stats.approvedUsers || 0}</p>
              </div>
            </div>
            <div className="quick-stat-item">
              <Clock className="status-icon warning" size={20} />
              <div className="quick-stat-info">
                <p className="quick-stat-label">Pending Verifications</p>
                <p className="quick-stat-value">{stats.pendingUsers || 0}</p>
              </div>
            </div>
            <div className="quick-stat-item">
              <AlertCircle className="status-icon danger" size={20} />
              <div className="quick-stat-info">
                <p className="quick-stat-label">Blocked Accounts</p>
                <p className="quick-stat-value">{stats.blockedUsers || 0}</p>
              </div>
            </div>
            <div className="quick-stat-item">
              <Heart className="status-icon info" size={20} />
              <div className="quick-stat-info">
                <p className="quick-stat-label">Pending Adoptions</p>
                <p className="quick-stat-value">{stats.pendingAdoptions || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card full-width">
        <h3 className="card-title">Recent Activity</h3>
        <div className="activity-list">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'user' && <Users size={16} />}
                  {activity.type === 'appointment' && <Calendar size={16} />}
                  {activity.type === 'product' && <Package size={16} />}
                  {activity.type === 'approval' && <CheckCircle size={16} />}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <p className="activity-time">{activity.timestamp}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activity">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

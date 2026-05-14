import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  BarChart3,
  Users,
  Calendar,
  Package,
  FileText,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Home
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import '../styles/admin.css';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/admin' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Appointments', icon: Calendar, path: '/admin/appointments' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Blogs', icon: FileText, path: '/admin/blogs' },
    { label: 'Adoptions', icon: Heart, path: '/admin/adoptions' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Heart className="logo-icon" fill="currentColor" />
            {sidebarOpen && <span>PetCare Admin</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <>
                  <span>{item.label}</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button
            className="topbar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <h1 className="page-title">
            {menuItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
          </h1>
          <div className="topbar-user">
            <span className="user-name-topbar">{user?.name}</span>
            <div className="user-avatar-small">{user?.name?.[0]?.toUpperCase()}</div>
          </div>
        </div>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}

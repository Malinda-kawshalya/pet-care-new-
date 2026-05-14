import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, Menu, PawPrint, Search, ShoppingCart, UserRound, LogOut } from "lucide-react";
import { useAuth, useUserRole } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelper";

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { userRole } = useUserRole();
  const navigate = useNavigate();

  // Public navigation items (visible to all)
  const publicNavItems = [
    { to: "/", label: "Home" },
    { to: "/modules/marketplace", label: "Shop" }
  ];

  // Dashboard item - only show if authenticated
  const dashboardItem = isAuthenticated ? {
    to: getDashboardPath(userRole),
    label: "Dashboard"
  } : null;

  // Additional items - only show if authenticated
  const authenticatedNavItems = isAuthenticated ? [
    { to: "/pets", label: "Pets" },
    { to: "/medical-records", label: "Health" },
    { to: "/appointments", label: "Bookings" },
    { to: "/community", label: "Community" },
    { to: "/matchmaking", label: "Match" },
    { to: "/adoption", label: "Adoption" },
    { to: "/messages", label: "Messages" },
    { to: "/ai", label: "AI" }
  ] : [];

  // Admin item - only show for admins
  const adminItem = isAuthenticated && userRole === 'admin' ? {
    to: "/dashboard/admin",
    label: "Admin"
  } : null;

  // Build navigation array
  const navItems = [
    ...publicNavItems,
    ...(dashboardItem ? [dashboardItem] : []),
    ...authenticatedNavItems,
    ...(adminItem ? [adminItem] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Pet Care home">
          <span className="brand-mark"><PawPrint size={18} /></span>
          <span>Pet Care</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "active" : ""}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="top-actions">
          <Link to="/modules/locations" className="icon-button" aria-label="Search nearby services">
            <Search size={18} />
          </Link>
          {isAuthenticated && (
            <Link to="/notifications" className="icon-button notification-dot" aria-label="Notifications">
              <Bell size={18} />
            </Link>
          )}
          <Link to="/modules/marketplace" className="icon-button" aria-label="Cart">
            <ShoppingCart size={18} />
          </Link>
          
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button className="icon-button user-button" aria-label="User menu" title={user?.name || "User"}>
                <UserRound size={18} />
              </button>
              <div className="user-dropdown">
                <div className="user-info">
                  <strong>{user?.name || "User"}</strong>
                  <small>{user?.email}</small>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/account" className="dropdown-item">My Profile</Link>
                <Link to="/account" className="dropdown-item">Settings</Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="icon-button" aria-label="Login">
              <UserRound size={18} />
            </Link>
          )}
          
          <button className="icon-button mobile-menu" aria-label="Menu">
            <Menu size={19} />
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

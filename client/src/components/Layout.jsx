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
    { to: "/about", label: "About" },
    { to: "/market", label: "Shop" },
    { to: "/contact", label: "Contact" }
  ];

  // Build navigation array - only public items
  const navItems = publicNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <div className="shell-decor" aria-hidden="true">
        <span className="shell-decor-paw left-a"><PawPrint size={34} /></span>
        <span className="shell-decor-paw left-b"><PawPrint size={24} /></span>
        <span className="shell-decor-paw right-a"><PawPrint size={30} /></span>
        <span className="shell-decor-paw right-b"><PawPrint size={40} /></span>
      </div>
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
          <Link to="/contact" className="topbar-cta">Let's talk</Link>
          <Link to="/modules/locations" className="icon-button" aria-label="Search nearby services">
            <Search size={18} />
          </Link>
          {isAuthenticated && (
            <Link to="/notifications" className="icon-button notification-dot" aria-label="Notifications">
              <Bell size={18} />
            </Link>
          )}
          <Link to="/cart" className="icon-button" aria-label="Cart">
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
                <Link to={getDashboardPath(userRole)} className="dropdown-item">
                  Go to Dashboard
                </Link>
                <Link to="/pets" className="dropdown-item">My Pets</Link>
                <Link to="/medical-records" className="dropdown-item">Health Records</Link>
                <Link to="/appointments" className="dropdown-item">Appointments</Link>
                <Link to="/messages" className="dropdown-item">Messages</Link>
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
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-mark"><PawPrint size={18} /></span>
              <span>Pet Care</span>
            </div>
            <p>
              A polished pet care platform for owners, clinics, shops, and groomers with one responsive interface.
            </p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            {publicNavItems.map((item) => (
              <Link key={item.to} to={item.to}>{item.label}</Link>
            ))}
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/login">Login</Link>
          </nav>
          <div className="footer-utility">
            <p>Need help choosing a service or role? Start at contact and we’ll route you to the right workflow.</p>
            <Link to="/contact" className="topbar-cta">Contact support</Link>
          </div>
        </div>
        <div className="footer-word">Pet<span>Care</span></div>
      </footer>
    </div>
  );
}

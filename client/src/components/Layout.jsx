import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Menu, PawPrint, Search, ShoppingCart, UserRound } from "lucide-react";
import { useAuth, useUserRole } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelper";

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { userRole } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  const publicNavItems = [
    { to: "/", label: "Home" },
    { to: "/market", label: "Shop" },
    { to: "/adoption", label: "Adoption" },
    { to: "/blogs", label: "Blogs" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" }
  ];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setIsFloating(y > 40);
      setShowScrollTop(y > 400);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <div className="shell-decor" aria-hidden="true">
        <span className="shell-decor-paw left-a"><PawPrint size={34} /></span>
        <span className="shell-decor-paw left-b"><PawPrint size={24} /></span>
        <span className="shell-decor-paw right-a"><PawPrint size={30} /></span>
        <span className="shell-decor-paw right-b"><PawPrint size={40} /></span>
      </div>

      <header className={`topbar ${isFloating ? 'floating' : ''}`}>
        <Link to="/" className="brand" aria-label="Pet Care home">
          <span className="brand-mark"><PawPrint size={18} /></span>
          <span>Pet Care</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {publicNavItems.map((item) => (
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
            <>
              <Link to="/notifications" className="icon-button notification-dot" aria-label="Notifications">
                <Bell size={18} />
              </Link>
              <Link to="/cart" className="icon-button" aria-label="Cart">
                <ShoppingCart size={18} />
              </Link>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/cart" className="icon-button" aria-label="Cart">
              <ShoppingCart size={18} />
            </Link>
          )}

          {isAuthenticated ? (
            <div
              className={`user-menu-container ${menuOpen ? "open" : ""}`}
              ref={menuRef}
              onMouseEnter={() => setMenuOpen(true)}
            >
              <button
                className="icon-button user-button"
                aria-label="User menu"
                aria-expanded={menuOpen}
                title={user?.name || "User"}
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <UserRound size={18} />
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <strong>{user?.name || "User"}</strong>
                    <small>{user?.email}</small>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to={getDashboardPath(userRole)} className="dropdown-item" onClick={closeMenu}>
                    Go to Dashboard
                  </Link>
                  <Link to="/pets" className="dropdown-item" onClick={closeMenu}>My Pets</Link>
                  <Link to="/medical-records" className="dropdown-item" onClick={closeMenu}>Health Records</Link>
                  <Link to="/appointments" className="dropdown-item" onClick={closeMenu}>Appointments</Link>
                  <Link to="/messages" className="dropdown-item" onClick={closeMenu}>Messages</Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/account" className="dropdown-item" onClick={closeMenu}>My Profile</Link>
                  <Link to="/account" className="dropdown-item" onClick={closeMenu}>Settings</Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-btn" type="button">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="topbar-cta">Login</Link>
              <Link to="/login" className="icon-button" aria-label="Login">
                <UserRound size={18} />
              </Link>
            </>
          )}

          <button className="icon-button mobile-menu" aria-label="Menu">
            <Menu size={19} />
          </button>
        </div>
      </header>

      {/* Spacer prevents layout jump when header becomes position:fixed */}
      {isFloating && <div className="topbar-spacer" aria-hidden="true" />}

      <main>
        <Outlet />
      </main>

      <button
        className={`scroll-to-top ${showScrollTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>

      {!isDashboardRoute && (
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="brand">
                <span className="brand-mark"><PawPrint size={18} /></span>
                <span>Pet Care</span>
              </div>
              <p className="footer-description">
                Daily pet care for owners, clinics, shops, and groomers in one connected, easy-to-use platform.
              </p>
            </div>
            <div className="footer-column footer-column-links">
              <h3>Explore</h3>
              <nav className="footer-links" aria-label="Footer navigation">
                {publicNavItems.map((item) => (
                  <Link key={item.to} to={item.to}>{item.label}</Link>
                ))}
              </nav>
              <nav className="footer-links footer-links-single" aria-label="Footer account links">
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </nav>
            </div>
            <div className="footer-column footer-column-support">
              <h3>Support</h3>
              <div className="footer-utility">
                <p><strong>Email:</strong> support@petcare.demo</p>
                <p><strong>Phone:</strong> +94 77 000 1000</p>
                <p><strong>Hours:</strong> Mon - Fri, 8:00 AM - 6:00 PM</p>
                <Link to="/contact" className="topbar-cta">Contact support</Link>
              </div>
            </div>
          </div>
          <div className="footer-word">Pet<span>Care</span></div>
        </footer>
      )}
    </div>
  );
}

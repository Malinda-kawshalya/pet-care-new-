import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, PawPrint, Search, ShoppingCart, UserRound, LogOut } from "lucide-react";
import { useAuth, useUserRole } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelper";

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { userRole } = useUserRole();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // Public navigation items (visible to all)
  const publicNavItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/market", label: "Shop" },
    { to: "/adoption", label: "Adoption" },
    { to: "/blogs", label: "Blogs" },
    { to: "/contact", label: "Contact" }
  ];

  // Build navigation array - only public items
  const navItems = publicNavItems;

          {isAuthenticated ? (
            <div className={`user-menu-container ${menuOpen ? "open" : ""}`} ref={menuRef}>
              <button
                className="icon-button user-button"
                aria-label="User menu"
                title={user?.name || "User"}
                type="button"
                ref={buttonRef}
                onClick={() => {
                  setMenuOpen((current) => {
                    const next = !current;
                    if (next) {
                      // compute fixed position for dropdown
                      const rect = buttonRef.current?.getBoundingClientRect();
                      if (rect) {
                        setDropdownStyle({ position: 'fixed', top: `${rect.bottom + 8}px`, right: `${window.innerWidth - rect.right}px`, minWidth: '240px' });
                      }
                    }
                    return next;
                  });
                }}
              >
                <UserRound size={18} />
              </button>
              <div className="user-dropdown" style={dropdownStyle}>
                <div className="user-info">
                  <strong>{user?.name || "User"}</strong>
                  <small>{user?.email}</small>
                </div>
                <div className="dropdown-divider"></div>
                <Link to={getDashboardPath(userRole)} className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  Go to Dashboard
                </Link>
                <Link to="/pets" className="dropdown-item" onClick={() => setMenuOpen(false)}>My Pets</Link>
                <Link to="/medical-records" className="dropdown-item" onClick={() => setMenuOpen(false)}>Health Records</Link>
                <Link to="/appointments" className="dropdown-item" onClick={() => setMenuOpen(false)}>Appointments</Link>
                <Link to="/messages" className="dropdown-item" onClick={() => setMenuOpen(false)}>Messages</Link>
                <div className="dropdown-divider"></div>
                <Link to="/account" className="dropdown-item" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <Link to="/account" className="dropdown-item" onClick={() => setMenuOpen(false)}>Settings</Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-btn" type="button">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
                type="button"
<<<<<<< HEAD
                aria-expanded={menuOpen}
                onClick={() => {
                  setMenuOpen((current) => {
                    const nextOpen = !current;
                    setMenuPinned(nextOpen);
                    return nextOpen;
=======
                ref={buttonRef}
                onClick={() => {
                  setMenuOpen((current) => {
                    const next = !current;
                    if (next) {
                      // compute fixed position for dropdown
                      const rect = buttonRef.current?.getBoundingClientRect();
                      if (rect) {
                        setDropdownStyle({ position: 'fixed', top: `${rect.bottom + 8}px`, right: `${window.innerWidth - rect.right}px`, minWidth: '240px' });
                      }
                    }
                    return next;
>>>>>>> b4d4e20 (mm)
                  });
                }}
              >
                <UserRound size={18} />
              </button>
              <div className="user-dropdown" style={dropdownStyle}>
                <div className="user-info">
                  <strong>{user?.name || "User"}</strong>
                  <small>{user?.email}</small>
                </div>
                <div className="dropdown-divider"></div>
                <Link to={getDashboardPath(userRole)} className="dropdown-item" onClick={() => setMenuPinned(false)}>
                  Go to Dashboard
                </Link>
                <Link to="/pets" className="dropdown-item" onClick={() => setMenuPinned(false)}>My Pets</Link>
                <Link to="/medical-records" className="dropdown-item" onClick={() => setMenuPinned(false)}>Health Records</Link>
                <Link to="/appointments" className="dropdown-item" onClick={() => setMenuPinned(false)}>Appointments</Link>
                <Link to="/messages" className="dropdown-item" onClick={() => setMenuPinned(false)}>Messages</Link>
                <div className="dropdown-divider"></div>
                <Link to="/account" className="dropdown-item" onClick={() => setMenuPinned(false)}>My Profile</Link>
                <Link to="/account" className="dropdown-item" onClick={() => setMenuPinned(false)}>Settings</Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-btn" type="button">
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

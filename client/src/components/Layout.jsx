import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, Menu, PawPrint, Search, ShoppingCart, UserRound } from "lucide-react";

export default function Layout() {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/modules/pets", label: "Pets" },
    { to: "/modules/health", label: "Health" },
    { to: "/modules/appointments", label: "Bookings" },
    { to: "/modules/marketplace", label: "Shop" },
    { to: "/modules/admin", label: "Admin" }
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Happy Pet home">
          <span className="brand-mark"><PawPrint size={18} /></span>
          <span>Pet Care</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="top-actions">
          <Link to="/modules/locations" className="icon-button" aria-label="Search nearby services">
            <Search size={18} />
          </Link>
          <Link to="/modules/notifications" className="icon-button notification-dot" aria-label="Notifications">
            <Bell size={18} />
          </Link>
          <Link to="/modules/marketplace" className="icon-button" aria-label="Cart">
            <ShoppingCart size={18} />
          </Link>
          <Link to="/login" className="icon-button" aria-label="Account">
            <UserRound size={18} />
          </Link>
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

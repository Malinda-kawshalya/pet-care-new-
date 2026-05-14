import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  PawPrint,
  Heart,
  Clock,
  Users,
  ShoppingBag,
  MessageSquare,
  Zap,
  Heart as HeartIcon,
  Stethoscope,
  Scissors,
  Package,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Menu
} from "lucide-react";
import { useAuth, useUserRole } from "../hooks/useAuth.js";

const menuItems = {
  petOwner: [
    { icon: PawPrint, label: "My Pets", to: "/pets" },
    { icon: Heart, label: "Health Records", to: "/medical-records" },
    { icon: Clock, label: "Appointments", to: "/appointments" },
    { icon: Users, label: "Community", to: "/community" },
    { icon: HeartIcon, label: "Matchmaking", to: "/matchmaking" },
    { icon: ShoppingBag, label: "Adoption", to: "/adoption" },
    { icon: MessageSquare, label: "Messages", to: "/messages" },
    { icon: Zap, label: "AI Assistant", to: "/ai" }
  ],
  veterinarian: [
    { icon: BarChart3, label: "Overview", to: "/dashboard/vet" },
    { icon: Clock, label: "Appointments", to: "/dashboard/vet?section=appointments" },
    { icon: Stethoscope, label: "Medical Records", to: "/dashboard/vet?section=records" },
    { icon: PawPrint, label: "Patients", to: "/dashboard/vet?section=patients" }
  ],
  petShop: [
    { icon: PawPrint, label: "My Pets", to: "/pets" },
    { icon: ShoppingBag, label: "Marketplace", to: "/modules/marketplace" },
    { icon: Package, label: "My Products", to: "/community" },
    { icon: Clock, label: "Orders", to: "/orders" },
    { icon: MessageSquare, label: "Messages", to: "/messages" }
  ],
  groomer: [
    { icon: Clock, label: "Appointments", to: "/appointments" },
    { icon: Scissors, label: "Services", to: "/community" },
    { icon: MessageSquare, label: "Messages", to: "/messages" }
  ],
  admin: [
    { icon: BarChart3, label: "Overview", to: "/dashboard/admin?section=overview" },
    { icon: Users, label: "Users Management", to: "/dashboard/admin?section=users" },
    { icon: Clock, label: "Appointments", to: "/dashboard/admin?section=appointments" },
    { icon: Package, label: "Products", to: "/dashboard/admin?section=products" },
    { icon: FileText, label: "Blogs", to: "/dashboard/admin?section=blogs" },
    { icon: Heart, label: "Adoptions", to: "/dashboard/admin?section=adoptions" },
    { icon: BarChart3, label: "Analytics", to: "/dashboard/admin?section=analytics" }
  ]
};

export default function DashboardSidebar() {
  const { logout } = useAuth();
  const { userRole } = useUserRole();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentMenuItems = menuItems[userRole] || menuItems.petOwner;

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
    navigate("/login");
  };

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      <button
        className="dashboard-mobile-trigger"
        type="button"
        aria-label="Open dashboard navigation"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      <div
        className={`dashboard-sidebar-overlay ${isMobileOpen ? "show" : ""}`}
        onClick={closeMobile}
        aria-hidden={!isMobileOpen}
      />

      <aside className={`dashboard-sidebar ${isExpanded ? "expanded" : "collapsed"} ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className={`brand-mini ${!isExpanded ? "hidden" : ""}`}>
            <span className="brand-icon"><PawPrint size={20} /></span>
            {isExpanded && <span className="brand-text">Pet Care</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            type="button"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {currentMenuItems.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
              title={item.label}
              onClick={closeMobile}
            >
              <item.icon size={18} />
              {isExpanded && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/account"
            className="sidebar-nav-item account-link"
            title="Account Settings"
            onClick={closeMobile}
          >
            <Settings size={18} />
            {isExpanded && <span>Settings</span>}
          </Link>
          <button
            className="sidebar-nav-item logout-link"
            onClick={handleLogout}
            title="Logout"
            type="button"
          >
            <LogOut size={18} />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

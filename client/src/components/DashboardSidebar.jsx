import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  ChevronDown
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
    { icon: Clock, label: "Appointments", to: "/appointments" },
    { icon: Stethoscope, label: "Medical Records", to: "/medical-records" },
    { icon: PawPrint, label: "Patients", to: "/pets" },
    { icon: MessageSquare, label: "Messages", to: "/messages" }
  ],
  petShop: [
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
    { icon: BarChart3, label: "Overview", to: "/dashboard/admin" },
    { icon: Users, label: "Users Management", to: "/dashboard/admin" },
    { icon: Clock, label: "Appointments", to: "/dashboard/admin" },
    { icon: Package, label: "Products", to: "/dashboard/admin" },
    { icon: FileText, label: "Blogs", to: "/dashboard/admin" },
    { icon: Heart, label: "Adoptions", to: "/dashboard/admin" },
    { icon: BarChart3, label: "Analytics", to: "/dashboard/admin" }
  ]
};

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const { userRole } = useUserRole();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const currentMenuItems = menuItems[userRole] || menuItems.petOwner;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`dashboard-sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <div className={`brand-mini ${!isExpanded ? "hidden" : ""}`}>
          <span className="brand-icon"><PawPrint size={20} /></span>
          {isExpanded && <span className="brand-text">Pet Care</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronDown size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {currentMenuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="sidebar-nav-item"
            title={item.label}
          >
            <item.icon size={18} />
            {isExpanded && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link
          to="/account"
          className="sidebar-nav-item account-link"
          title="Account Settings"
        >
          <Settings size={18} />
          {isExpanded && <span>Settings</span>}
        </Link>
        <button
          className="sidebar-nav-item logout-link"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

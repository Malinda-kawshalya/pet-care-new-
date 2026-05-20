import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  PawPrint,
  Heart,
  Clock,
  Users,
  ShoppingBag,
  MessageSquare,
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
  petOwner: {
    groups: [
      {
        id: "pet-care",
        title: "Pet care",
        items: [
          { icon: PawPrint, label: "My Pets", to: "/dashboard/petowner?section=pets" },
          { icon: Heart, label: "Health Records", to: "/dashboard/petowner?section=health-records" },
          { icon: Clock, label: "Appointments", to: "/dashboard/petowner?section=appointments" }
        ]
      },
      {
        id: "social",
        title: "Social",
        items: [
          { icon: Users, label: "Community", to: "/dashboard/petowner?section=community" },
          { icon: HeartIcon, label: "Matchmaking", to: "/dashboard/petowner?section=matchmaking" }
        ]
      },
      {
        id: "adoption",
        title: "Adoption",
        items: [
          { icon: ShoppingBag, label: "Adoption", to: "/dashboard/petowner?section=adoption" }
        ]
      }
    ]
  },
  veterinarian: [
    { icon: BarChart3, label: "Overview", to: "/dashboard/vet" },
    { icon: Clock, label: "Appointments", to: "/dashboard/vet?section=appointments" },
    { icon: Stethoscope, label: "Medical Records", to: "/dashboard/vet?section=records" },
    { icon: PawPrint, label: "Patients", to: "/dashboard/vet?section=patients" },
    { icon: ShoppingBag, label: "Adoption", to: "/dashboard/adoption" }
  ],
  petShop: [
    { icon: PawPrint, label: "My Pets", to: "/pets" },
    { icon: ShoppingBag, label: "Marketplace", to: "/modules/marketplace" },
    { icon: Package, label: "My Products", to: "/community" },
    { icon: Clock, label: "Orders", to: "/orders" },
    { icon: MessageSquare, label: "Messages", to: "/messages" },
    { icon: ShoppingBag, label: "Adoption", to: "/dashboard/adoption" }
  ],
  groomer: [
    { icon: BarChart3, label: "Overview", to: "/dashboard/groomer?section=overview" },
    { icon: Clock, label: "Appointments", to: "/dashboard/groomer?section=appointments" },
    { icon: Scissors, label: "Services", to: "/dashboard/groomer?section=services" },
    { icon: MessageSquare, label: "Messages", to: "/messages" },
    { icon: ShoppingBag, label: "Adoption", to: "/dashboard/adoption" }
  ],
  admin: [
    { icon: BarChart3, label: "Overview", to: "/dashboard/admin?section=overview" },
    { icon: Users, label: "Users Management", to: "/dashboard/admin?section=users" },
    { icon: Clock, label: "Appointments", to: "/dashboard/admin?section=appointments" },
    { icon: Package, label: "Products", to: "/dashboard/admin?section=products" },
    { icon: FileText, label: "Blogs", to: "/dashboard/admin?section=blogs" },
    { icon: Heart, label: "Adoptions", to: "/dashboard/admin?section=adoptions" },
    { icon: Stethoscope, label: "Health Recording", to: "/dashboard/admin?section=health" },
    { icon: MessageSquare, label: "Messages", to: "/dashboard/admin?section=messages" },
    { icon: BarChart3, label: "Analytics", to: "/dashboard/admin?section=analytics" }
  ]
};

export default function DashboardSidebar() {
  const { logout } = useAuth();
  const { userRole } = useUserRole();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const currentMenuItems = menuItems[userRole] || menuItems.petOwner;
  const isGroupedMenu = Boolean(currentMenuItems?.groups);
  const location = useLocation();

  const isActiveItem = (item) => {
    const [pathOnly, search] = (item.to || "").split("?");
    if (search) {
      const params = new URLSearchParams(search);
      const section = params.get("section");
      const currentSection = new URLSearchParams(location.search).get("section");
      if (section) return section === currentSection;
    }
    // fallback to pathname compare
    return location.pathname === pathOnly;
  };

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
    navigate("/login");
  };

  const closeMobile = () => setIsMobileOpen(false);

  const flattenedMenuItems = useMemo(() => {
    if (!isGroupedMenu) return currentMenuItems;
    return currentMenuItems.groups.flatMap((group) => group.items);
  }, [currentMenuItems, isGroupedMenu]);

  useEffect(() => {
    if (!isGroupedMenu) return;
    const initialGroups = {};
    currentMenuItems.groups.forEach((group) => {
      initialGroups[group.id] = true;
    });
    setOpenGroups(initialGroups);
  }, [currentMenuItems, isGroupedMenu, userRole]);

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
          {isGroupedMenu && isExpanded ? (
            currentMenuItems.groups.map((group) => (
              <div className="sidebar-group" key={group.id}>
                <button
                  className={`sidebar-group-toggle ${openGroups[group.id] ? "open" : ""}`}
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [group.id]: !prev[group.id]
                    }))
                  }
                >
                  <span>{group.title}</span>
                  <ChevronDown size={16} />
                </button>
                {openGroups[group.id] && (
                  <div className="sidebar-group-items">
                    {group.items.map((item) => (
                      <NavLink
                        key={`${item.to}-${item.label}`}
                        to={item.to}
                        className={() => `sidebar-nav-item ${isActiveItem(item) ? "active" : ""}`}
                        title={item.label}
                        onClick={closeMobile}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            flattenedMenuItems.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                className={() => `sidebar-nav-item ${isActiveItem(item) ? "active" : ""}`}
                title={item.label}
                onClick={closeMobile}
              >
                <item.icon size={18} />
                {isExpanded && <span>{item.label}</span>}
              </NavLink>
            ))
          )}
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

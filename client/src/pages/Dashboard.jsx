import { Navigate } from "react-router-dom";
import { useUserRole } from "../hooks/useAuth.js";
import PetOwnerDashboard from "../components/dashboards/PetOwnerDashboard.jsx";
import VetDashboard from "../components/dashboards/VetDashboard.jsx";
import PetShopDashboard from "../components/dashboards/PetShopDashboard.jsx";
import GroomerDashboard from "../components/dashboards/GroomerDashboard.jsx";
import AdminDashboard from "../components/dashboards/AdminDashboard.jsx";

export default function Dashboard() {
  const { isPetOwner, isVet, isPetShop, isGroomer, isAdmin } = useUserRole();

  if (isPetOwner) {
    return <PetOwnerDashboard />;
  }

  if (isVet) {
    return <VetDashboard />;
  }

  if (isPetShop) {
    return <PetShopDashboard />;
  }

  if (isGroomer) {
    return <GroomerDashboard />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <Navigate to="/login" replace />;
}

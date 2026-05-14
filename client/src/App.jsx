import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ModulePage from "./pages/ModulePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Community from "./pages/Community.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders, { OrderView } from "./pages/Orders.jsx";
import MedicalRecords from "./pages/MedicalRecords.jsx";
import Vaccinations from "./pages/Vaccinations.jsx";
import Appointments from "./pages/Appointments.jsx";
import Matchmaking from "./pages/Matchmaking.jsx";
import Adoption from "./pages/Adoption.jsx";
import Messages from "./pages/Messages.jsx";
import Notifications from "./pages/Notifications.jsx";
import AI from "./pages/AI.jsx";

// Dashboard Components
import PetOwnerDashboard from "./components/dashboards/PetOwnerDashboard.jsx";
import VetDashboard from "./components/dashboards/VetDashboard.jsx";
import PetShopDashboard from "./components/dashboards/PetShopDashboard.jsx";
import GroomerDashboard from "./components/dashboards/GroomerDashboard.jsx";
import AdminDashboard from "./components/dashboards/AdminDashboard.jsx";
import PetProfiles from "./pages/PetProfiles.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/modules/:moduleId" element={<ModulePage />} />
        
        {/* Protected Routes - Dashboard redirect (legacy) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute element={<Dashboard />} />
          } 
        />
        
        {/* Protected Routes - Role-based Dashboards */}
        <Route 
          path="/dashboard/petowner" 
          element={
            <ProtectedRoute 
              element={<PetOwnerDashboard />} 
              requiredRole="petOwner" 
            />
          } 
        />
        
        <Route 
          path="/dashboard/vet" 
          element={
            <ProtectedRoute 
              element={<VetDashboard />} 
              requiredRole="veterinarian" 
            />
          } 
        />
        
        <Route 
          path="/dashboard/petshop" 
          element={
            <ProtectedRoute 
              element={<PetShopDashboard />} 
              requiredRole="petShop" 
            />
          } 
        />
        
        <Route 
          path="/dashboard/groomer" 
          element={
            <ProtectedRoute 
              element={<GroomerDashboard />} 
              requiredRole="groomer" 
            />
          } 
        />
        
        {/* Admin Dashboard - ONLY for admins */}
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute 
              element={<AdminDashboard />} 
              adminOnly={true}
            />
          } 
        />

        {/* Pets management for authenticated users */}
        <Route
          path="/pets"
          element={<ProtectedRoute element={<PetProfiles />} />}
        />

        <Route
          path="/community"
          element={<ProtectedRoute element={<Community />} />}
        />
        <Route path="/market" element={<Marketplace />} />
        <Route path="/market/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute element={<Checkout />} />} />
        <Route path="/orders" element={<ProtectedRoute element={<Orders />} />} />
        <Route path="/orders/:id" element={<ProtectedRoute element={<OrderView />} />} />
        <Route path="/medical-records" element={<ProtectedRoute element={<MedicalRecords />} />} />
        <Route path="/vaccinations" element={<ProtectedRoute element={<Vaccinations />} />} />
        <Route path="/appointments" element={<ProtectedRoute element={<Appointments />} />} />
        <Route path="/matchmaking" element={<ProtectedRoute element={<Matchmaking />} />} />
        <Route path="/adoption" element={<ProtectedRoute element={<Adoption />} />} />
        <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/ai" element={<ProtectedRoute element={<AI />} />} />
      </Route>
    </Routes>
  );
}

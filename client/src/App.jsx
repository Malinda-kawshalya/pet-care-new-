import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ModulePage from "./pages/ModulePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";

// Dashboard Components
import PetOwnerDashboard from "./components/dashboards/PetOwnerDashboard.jsx";
import VetDashboard from "./components/dashboards/VetDashboard.jsx";
import PetShopDashboard from "./components/dashboards/PetShopDashboard.jsx";
import GroomerDashboard from "./components/dashboards/GroomerDashboard.jsx";
import AdminDashboard from "./components/dashboards/AdminDashboard.jsx";

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
              requiredRole="vet" 
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
      </Route>
    </Routes>
  );
}

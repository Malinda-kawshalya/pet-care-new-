import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useUserRole } from '../hooks/useAuth';

// Component to protect routes based on authentication and role
const ProtectedRoute = ({ element, requiredRole, requiredRoles, adminOnly = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { userRole } = useUserRole();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin-only routes
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Check for specific single role requirement
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Check for multiple role requirements
  if (requiredRoles && Array.isArray(requiredRoles) && !requiredRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;

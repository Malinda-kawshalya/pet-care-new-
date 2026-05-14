import { useContext, useState, useEffect } from 'react';
import { getUser, getAuthToken, isAuthenticated, logout } from '../utils/authHelper';
import { getRolePermissions } from '../utils/roleHelper';

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getUser();
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    logout: handleLogout
  };
};

// Custom hook for role-based permissions
export const useRole = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    if (user && user.role) {
      setPermissions(getRolePermissions(user.role));
    }
  }, [user]);

  const canAccess = (permission) => {
    return permissions[permission] || false;
  };

  return {
    userRole: user?.role,
    permissions,
    canAccess
  };
};

// Custom hook for checking if user has specific role
export const useUserRole = () => {
  const { user } = useAuth();
  
  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.includes(user?.role);
    }
    return user?.role === role;
  };

  return {
    userRole: user?.role,
    hasRole,
    isPetOwner: user?.role === 'petOwner',
    isVet: user?.role === 'veterinarian',
    isPetShop: user?.role === 'petShop',
    isGroomer: user?.role === 'groomer',
    isAdmin: user?.role === 'admin'
  };
};

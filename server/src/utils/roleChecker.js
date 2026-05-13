// Role checker utility functions
export const ROLES = {
  PET_OWNER: 'petOwner',
  VETERINARIAN: 'vet',
  PET_SHOP: 'petShop',
  GROOMER: 'groomer',
  ADMIN: 'admin'
};

export const ROLE_NAMES = {
  petOwner: 'Pet Owner',
  vet: 'Veterinarian',
  petShop: 'Pet Shop Owner',
  groomer: 'Groomer',
  admin: 'Administrator'
};

// Check if role is valid
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

// Check if user is a service provider
export const isServiceProvider = (role) => {
  return [ROLES.VETERINARIAN, ROLES.PET_SHOP, ROLES.GROOMER].includes(role);
};

// Get role display name
export const getRoleName = (role) => {
  return ROLE_NAMES[role] || 'Unknown Role';
};

// Check if user has required role
export const hasRole = (userRole, requiredRole) => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};

// Get dashboard path based on role
export const getDashboardPath = (role) => {
  const paths = {
    [ROLES.PET_OWNER]: '/api/dashboard/petowner',
    [ROLES.VETERINARIAN]: '/api/dashboard/vet',
    [ROLES.PET_SHOP]: '/api/dashboard/petshop',
    [ROLES.GROOMER]: '/api/dashboard/groomer',
    [ROLES.ADMIN]: '/api/dashboard/admin'
  };
  return paths[role] || '/api/dashboard';
};

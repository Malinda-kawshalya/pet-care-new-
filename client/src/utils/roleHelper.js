// Role-based helper functions
export const USER_ROLES = {
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

export const getDashboardPath = (role) => {
  const paths = {
    [USER_ROLES.PET_OWNER]: '/dashboard/petowner',
    [USER_ROLES.VETERINARIAN]: '/dashboard/vet',
    [USER_ROLES.PET_SHOP]: '/dashboard/petshop',
    [USER_ROLES.GROOMER]: '/dashboard/groomer',
    [USER_ROLES.ADMIN]: '/dashboard/admin'
  };
  return paths[role] || '/dashboard';
};

export const hasRole = (userRole, requiredRole) => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};

export const getRolePermissions = (role) => {
  const permissions = {
    [USER_ROLES.PET_OWNER]: {
      canViewPets: true,
      canManageAppointments: true,
      canViewMedicalRecords: true,
      canBrowseMarketplace: true,
      canAdopt: true,
      canMatch: true,
      canViewCommunity: true,
      canManageUsers: false,
      canApproveAccounts: false,
      canModerate: false
    },
    [USER_ROLES.VETERINARIAN]: {
      canViewPets: true,
      canManageAppointments: true,
      canViewMedicalRecords: true,
      canBrowseMarketplace: true,
      canAdopt: false,
      canMatch: false,
      canViewCommunity: true,
      canManageUsers: false,
      canApproveAccounts: false,
      canModerate: false
    },
    [USER_ROLES.PET_SHOP]: {
      canViewPets: false,
      canManageAppointments: false,
      canViewMedicalRecords: false,
      canBrowseMarketplace: true,
      canAdopt: false,
      canMatch: false,
      canViewCommunity: true,
      canManageUsers: false,
      canApproveAccounts: false,
      canModerate: false
    },
    [USER_ROLES.GROOMER]: {
      canViewPets: true,
      canManageAppointments: true,
      canViewMedicalRecords: false,
      canBrowseMarketplace: false,
      canAdopt: false,
      canMatch: false,
      canViewCommunity: true,
      canManageUsers: false,
      canApproveAccounts: false,
      canModerate: false
    },
    [USER_ROLES.ADMIN]: {
      canViewPets: true,
      canManageAppointments: true,
      canViewMedicalRecords: true,
      canBrowseMarketplace: true,
      canAdopt: true,
      canMatch: true,
      canViewCommunity: true,
      canManageUsers: true,
      canApproveAccounts: true,
      canModerate: true
    }
  };
  return permissions[role] || {};
};

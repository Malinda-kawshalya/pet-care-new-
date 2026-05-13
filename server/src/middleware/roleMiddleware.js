// Role-based middleware for protecting routes
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check if user has specific role
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

// Middleware to verify user is service provider (vet, petShop, groomer)
const isServiceProvider = (req, res, next) => {
  const serviceProviderRoles = ['vet', 'petShop', 'groomer'];
  
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!serviceProviderRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Service providers only' });
  }

  next();
};

// Middleware to check if user owns the resource
const checkOwnership = async (req, res, next, resourceUserId) => {
  if (req.user.id !== resourceUserId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You do not own this resource' });
  }

  next();
};

export { roleMiddleware, checkRole, isServiceProvider, checkOwnership };

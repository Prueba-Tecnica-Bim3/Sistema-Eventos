const validateRole = (...allowedRoles) => (req, res, next) => {
  const userRoles = req.user?.roles;
  const roles = Array.isArray(userRoles) ? userRoles : [userRoles].filter(Boolean);

  const hasAllowedRole = roles.some((role) => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    return res.status(403).json({
      success: false,
      message: 'No tiene permisos para realizar esta accion',
      error: 'Forbidden',
      details: [],
    });
  }

  return next();
};

module.exports = validateRole;

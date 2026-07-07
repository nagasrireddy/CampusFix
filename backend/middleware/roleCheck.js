// ---------------------------------------------------------
// middleware/roleCheck.js
// Factory that produces middleware restricting a route to a
// specific set of roles. Must run AFTER `protect` since it
// depends on req.user being populated.
//
// Usage:
//   router.post('/assign', protect, authorizeRoles('admin'), controllerFn);
// ---------------------------------------------------------

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(401);
      throw new Error('Not authorized - authentication required before role check');
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied - this action requires one of the following roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };

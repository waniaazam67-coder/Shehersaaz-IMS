const authProviderService = require("../services/authProviderService");
const userService = require("../services/userService");

async function requireAuth(req, res, next) {
  try {
    const identity = await authProviderService.verifyRequest(req);
    const user = await userService.ensureAuthProviderUser(identity);
    if (!user || user.status !== "active") {
      return res.status(403).json({ success: false, error: { message: "IMS account is not active." } });
    }

    // req.user is the only trusted identity source for protected routes.
    req.user = user;
    req.authIdentity = identity;
    return next();
  } catch (error) {
    return res.status(error.statusCode || 401).json({ success: false, error: { message: error.message || "Authentication failed." } });
  }
}

function hasPermission(user, permission) {
  return user?.roles?.includes("Admin") || user?.permissions?.includes(permission);
}

function requireAdmin(req, res, next) {
  if (!req.user?.roles?.includes("Admin")) {
    return res.status(403).json({
      success: false,
      error: { message: "Admin access is required." }
    });
  }
  return next();
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (hasPermission(req.user, permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: { message: "You do not have permission to perform this action." }
    });
  };
}

module.exports = {
  requireAuth,
  requireAdmin,
  requirePermission,
  hasPermission
};

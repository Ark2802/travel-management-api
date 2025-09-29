/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based permissions after JWT verification
 */

/**
 * Creates middleware that checks if user has required role(s)
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists (should be set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(
            ", "
          )}. Your role: ${req.user.role}`,
        });
      }

      next();
    } catch (error) {
      console.error("Role verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during role verification",
      });
    }
  };
};

/**
 * Specific role middleware functions for common use cases
 */
const requireAdmin = requireRole("admin");
const requireOwner = requireRole("owner");
const requireDriver = requireRole("driver");
const requireCustomer = requireRole("customer");

// Allow multiple roles
const requireAdminOrOwner = requireRole("admin", "owner");
const requireOwnerOrDriver = requireRole("owner", "driver");

/**
 * Middleware to check if user can access their own resource or is admin
 * @param {string} paramName - Name of the route parameter containing user ID
 * @returns {Function} Express middleware function
 */
const requireSelfOrAdmin = (paramName = "id") => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const targetUserId = req.params[paramName];
      const currentUserId = req.user._id.toString();

      // Allow if user is admin or accessing their own resource
      if (req.user.role === "admin" || currentUserId === targetUserId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only access your own resources or need admin privileges",
      });
    } catch (error) {
      console.error("Self or admin verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization",
      });
    }
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireOwner,
  requireDriver,
  requireCustomer,
  requireAdminOrOwner,
  requireOwnerOrDriver,
  requireSelfOrAdmin,
};

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
}

/**
 * Permission mapping
 */
export const permissions = {
  Manager: [
    'create_user',
    'edit_user',
    'delete_user',
    'create_product',
    'edit_product',
    'delete_product',
    'process_sale',
    'view_sales',
    'delete_sale',
    'add_expense',
    'edit_expense',
    'delete_expense',
    'view_reports',
    'export_reports',
    'view_dashboard'
  ],
  Admin: [
    'create_product',
    'edit_product',
    'delete_product',
    'process_sale',
    'view_sales',
    'add_expense',
    'edit_expense',
    'view_reports',
    'export_reports',
    'view_dashboard'
  ],
  Cashier: ['process_sale', 'view_sales', 'view_dashboard']
};

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission name
 */
export function hasPermission(userRole, permission) {
  return permissions[userRole]?.includes(permission) || false;
}


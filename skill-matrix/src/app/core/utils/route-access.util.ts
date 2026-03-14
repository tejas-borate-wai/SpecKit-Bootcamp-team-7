/**
 * Determines whether a given route is accessible to the specified user role.
 * Used by notifications-list to guard linkTo deep-link navigation.
 */
export function canAccessRoute(route: string, userRole: string): boolean {
  if (!route) return false;

  const managerAdminRoutes = ['/team', '/projects', '/reports'];
  const adminOnlyRoutes = ['/admin'];

  if (adminOnlyRoutes.some((r) => route.startsWith(r))) {
    return userRole === 'Admin';
  }

  if (managerAdminRoutes.some((r) => route.startsWith(r))) {
    return userRole === 'Manager' || userRole === 'Admin';
  }

  // All other authenticated routes are accessible to every role
  return true;
}

import { useUserRole, type UserRole } from "./useUserRole";

/**
 * Helper hook to generate role-based navigation paths
 * In the new hybrid architecture, we use unprefixed routes for the dashboard.
 */
export const useRoleBasedNavigation = () => {
  const { data: userRole } = useUserRole();

  // Get the role prefix for path generation
  const getRolePrefix = (): string => {
    if (!userRole) return 'candidate';

    switch (userRole) {
      case 'super_admin':
        return 'admin';
      case 'institution_admin':
        return 'institution';
      case 'instructor':
        return 'instructor';
      case 'candidate':
      default:
        return 'candidate';
    }
  };

  const rolePrefix = getRolePrefix();

  // Generate paths that match App.tsx unprefixed routing
  const getPath = (relativePath: string): string => {
    // Remove leading slash if present
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

    return `/${cleanPath}`;
  };

  return {
    rolePrefix,
    userRole,
    getPath,
    // Convenience methods for common paths matching App.tsx routes
    dashboardPath: `/dashboard`,
    certificatesPath: `/certificates`,
    issuePath: `/issue`,
    batchIssuePath: `/batch-issue`,
    analyticsPath: `/analytics`,
    myCertificatesPath: `/my-certificates`,
    settingsPath: `/settings`,
  };
};

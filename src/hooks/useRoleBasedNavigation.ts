import { useUserRole, type UserRole } from "./useUserRole";

/**
 * Helper hook to generate role-based navigation paths
 * This ensures all internal navigation matches the routing structure in App.tsx
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

  // Generate role-based paths
  const getPath = (relativePath: string): string => {
    // Remove leading slash if present
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    
    // Settings routes are shared across all roles (no prefix)
    if (cleanPath.startsWith('settings/')) {
      return `/${cleanPath}`;
    }
    
    // Profile and identity routes (no prefix)
    if (cleanPath.startsWith('profile/') || cleanPath.startsWith('identity/')) {
      return `/${cleanPath}`;
    }
    
    // All other dashboard routes get role prefix
    return `/${rolePrefix}/${cleanPath}`;
  };

  return {
    rolePrefix,
    userRole,
    getPath,
    // Convenience methods for common paths
    dashboardPath: `/${rolePrefix}/dashboard`,
    certificatesPath: `/${rolePrefix}/certificates`,
    issuePath: `/${rolePrefix}/issue`,
    batchIssuePath: `/${rolePrefix}/batch-issue`,
    analyticsPath: `/${rolePrefix}/analytics`,
    myCertificatesPath: `/${rolePrefix}/my-certificates`,
    settingsPath: `/settings`,
  };
};

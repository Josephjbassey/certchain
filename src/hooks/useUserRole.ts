import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';

export type UserRole =
  | 'super_admin'
  | 'institution_admin'
  | 'instructor'
  | 'candidate';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery<UserRole | null>({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Development override support for quick UI testing
      if (import.meta.env.MODE === 'development') {
          const override = import.meta.env.VITE_DEV_LOCAL_ROLE as UserRole | undefined;
          if (override) return override;
      }

      // Default to least-privileged role
      // TODO: Replace with Smart Contract RBAC check in pure dApp mode
      return 'candidate';
    },
    enabled: !!user,
  });
};

/**
 * Checks if the current user has a role that meets or exceeds the required role.
 * Hierarchy: super_admin > institution_admin > instructor > candidate.
 */
export const useHasRole = (requiredRole: UserRole) => {
  const { data: userRole, isLoading } = useUserRole();

  const hasRole = () => {
    if (!userRole) return false;

    // Super admin has access to everything
    if (userRole === 'super_admin') return true;

    // Institution admin has access to institution features and below
    if (requiredRole === 'institution_admin')
      return userRole === 'institution_admin' || userRole === 'super_admin';

    // Instructor has access to instructor and candidate features
    if (requiredRole === 'instructor')
      return ['instructor', 'institution_admin', 'super_admin'].includes(userRole);

    // Candidate is the lowest access level; all authenticated roles may access candidate features
    if (requiredRole === 'candidate') return true;

    return userRole === requiredRole;
  };

  return { hasRole: hasRole(), isLoading };
};

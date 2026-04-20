import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';

export type UserRole =
  | 'super_admin'
  | 'institution_admin'
  | 'instructor'
  | 'candidate';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      // TODO: Replace with Smart Contract RBAC check
      return 'super_admin' as UserRole; // Placeholder for UI dev
    },
    enabled: !!user,
  });
};

export const useHasRole = (requiredRole: UserRole) => {
  const { data: userRole, isLoading } = useUserRole();

  const hasRole = () => {
    if (!userRole) return false;
    const role = userRole as string;
    const required = requiredRole as string;
    if (role === 'super_admin') return true;
    if (required === 'institution_admin') return role === 'institution_admin' || role === 'super_admin';
    if (required === 'instructor') return ['instructor', 'institution_admin', 'super_admin'].includes(role);
    if (required === 'candidate') return true;
    return role === required;
  };

  return { hasRole: hasRole(), isLoading };
};

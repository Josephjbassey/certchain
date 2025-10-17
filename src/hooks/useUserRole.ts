import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';

export type UserRole = 'admin' | 'issuer' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // @ts-ignore - Supabase types not generated
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user' as UserRole;
      }

      if (!data) {
        // User doesn't have a role yet, assign default
        console.log('No role found for user, assigning default user role');
        return 'user' as UserRole;
      }

      const role = data && typeof data === 'object' && 'role' in data ? (data as any).role : 'user';
      return (role || 'user') as UserRole;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useHasRole = (requiredRole: UserRole) => {
  const { data: userRole, isLoading } = useUserRole();
  
  const hasRole = () => {
    if (!userRole) return false;
    
    if (requiredRole === 'user') return true;
    if (requiredRole === 'issuer') return userRole === 'issuer' || userRole === 'admin';
    if (requiredRole === 'admin') return userRole === 'admin';
    
    return false;
  };

  return { hasRole: hasRole(), isLoading };
};

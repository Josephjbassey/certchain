import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';

export type UserRole = 'super_admin' | 'institution_admin' | 'instructor' | 'candidate' | 'admin' | 'issuer' | 'user';

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
        // User doesn't have a role yet, assign default candidate role
        console.log('No role found for user, assigning default candidate role');
        return 'candidate' as UserRole;
      }

      const role = data && typeof data === 'object' && 'role' in data ? (data as any).role : 'candidate';
      return (role || 'candidate') as UserRole;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useHasRole = (requiredRole: UserRole) => {
  const { data: userRole, isLoading } = useUserRole();
  
  const hasRole = () => {
    if (!userRole) return false;
    
    // Super admin has access to everything
    if (userRole as string === 'super_admin') return true;
    
    // Institution admin has access to institution features and below
    if (requiredRole as string === 'institution_admin') 
      return (userRole as string) === 'institution_admin' || (userRole as string) === 'super_admin';
    
    // Instructor has access to instructor and candidate features
    if (requiredRole as string === 'instructor') 
      return ['instructor', 'institution_admin', 'super_admin'].includes(userRole as string);
    
    // Candidate only has access to candidate features
    if (requiredRole as string === 'candidate') return true;
    
    // Backward compatibility for old roles
    if (requiredRole as string === 'admin') return ['super_admin', 'admin'].includes(userRole as string);
    if (requiredRole as string === 'issuer') return ['super_admin', 'institution_admin', 'instructor', 'admin', 'issuer'].includes(userRole as string);
    if (requiredRole as string === 'user') return true;
    
    return userRole === requiredRole;
  };

  return { hasRole: hasRole(), isLoading };
};

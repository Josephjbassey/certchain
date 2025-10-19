import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';

export type UserRole = 
  | 'super_admin' 
  | 'institution_admin' 
  | 'instructor' 
  | 'candidate' 
  | 'admin' // Legacy
  | 'issuer' // Legacy
  | 'user'; // Legacy

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // In a multi-role system, a user might have several. We fetch all and determine the highest privilege.
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user role:', error);
        return 'candidate' as UserRole; // Safest default
      }

      if (!data || data.length === 0) {
        // This case should be rare if the signup trigger works, but as a fallback:
        console.warn('No role found for user, defaulting to candidate.');
        return 'candidate' as UserRole;
      }

      // Determine the highest-level role from the roles array
      const roles = data.map(r => r.role);
      if (roles.includes('super_admin')) return 'super_admin' as UserRole;
      if (roles.includes('admin')) return 'admin' as UserRole; // Legacy admin
      if (roles.includes('institution_admin')) return 'institution_admin' as UserRole;
      if (roles.includes('instructor')) return 'instructor' as UserRole;
      if (roles.includes('issuer')) return 'issuer' as UserRole; // Legacy issuer
      if (roles.includes('candidate')) return 'candidate' as UserRole;
      if (roles.includes('user')) return 'user' as UserRole; // Legacy user

      return 'candidate' as UserRole; // Default fallback
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Checks if the current user has a role that meets or exceeds the required role.
 * This follows the new hierarchy: super_admin > institution_admin > instructor > candidate.
 * It also handles legacy roles for backward compatibility.
 */
export const useHasRole = (requiredRole: UserRole) => {
  const { data: userRole, isLoading } = useUserRole();
  
  const hasRole = () => {
    if (!userRole) return false;
    
    const role = userRole as string;
    const required = requiredRole as string;
    
    // Super admin has access to everything
    if (role === 'super_admin') return true;
    // Legacy admin is treated like super_admin
    if (role === 'admin') return true;
    
    // Institution admin has access to institution features and below
    if (required === 'institution_admin') 
      return role === 'institution_admin' || role === 'super_admin';
    
    // Instructor has access to instructor and candidate features
    if (required === 'instructor') 
      return ['instructor', 'institution_admin', 'super_admin', 'admin', 'issuer'].includes(role);
    
    // Candidate only has access to candidate features
    if (required === 'candidate') return true;
    
    // Backward compatibility for old roles
    if (required === 'admin') return ['super_admin', 'admin'].includes(role);
    if (required === 'issuer') return ['super_admin', 'institution_admin', 'instructor', 'admin', 'issuer'].includes(role);
    if (required === 'user') return true;
    
    return role === required;
  };

  return { hasRole: hasRole(), isLoading };
};

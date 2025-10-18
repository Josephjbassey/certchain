import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';

export type UserRole = 'super_admin' | 'institution_admin' | 'instructor' | 'candidate' | 'admin' | 'issuer' | 'user';
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

      // @ts-ignore - Supabase types not generated
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
      // In a multi-role system, a user might have several. We fetch all and determine the highest privilege.
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user' as UserRole;
        return 'candidate' as UserRole; // Safest default
      }

      if (!data) {
        // User doesn't have a role yet, assign default candidate role
        console.log('No role found for user, assigning default candidate role');
      if (!data || data.length === 0) {
        // This case should be rare if the signup trigger works, but as a fallback:
        console.warn('No role found for user, defaulting to candidate.');
        return 'candidate' as UserRole;
      }

      const role = data && typeof data === 'object' && 'role' in data ? (data as any).role : 'candidate';
      return (role || 'candidate') as UserRole;
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
    
    // Super admin has access to everything
    if (userRole as string === 'super_admin') return true;
    if (userRole === 'super_admin') return true;
    // Legacy admin is treated like super_admin
    if (userRole === 'admin') return true;
    
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
    const hierarchy: UserRole[] = ['candidate', 'user', 'issuer', 'instructor', 'institution_admin', 'admin', 'super_admin'];

    const userLevel = hierarchy.indexOf(userRole);
    const requiredLevel = hierarchy.indexOf(requiredRole);

    if (userLevel === -1 || requiredLevel === -1) {
      // One of the roles is not in the hierarchy, do a direct comparison
      return userRole === requiredRole;
    }

    // A user has the required role if their level is greater than or equal to the required level.
    // Special handling for legacy 'issuer' which is parallel to 'instructor'
    if (requiredRole === 'issuer' && (userRole === 'instructor' || userRole === 'institution_admin')) {
      return true;
    }

    return userLevel >= requiredLevel;
  };

  return { hasRole: hasRole(), isLoading };
};

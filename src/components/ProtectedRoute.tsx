import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  // Show loading state while checking auth and role
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check role requirements
  if (requiredRole && userRole) {
    const hasPermission = checkRolePermission(userRole, requiredRole);
    
    if (!hasPermission) {
      // Redirect based on actual role
      const redirectPath = getDefaultPathForRole(userRole);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

// Helper function to check if user has required permission
const checkRolePermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleStr = userRole as string;
  const requiredStr = requiredRole as string;
  
  // Super admin has access to everything
  if (roleStr === 'super_admin') return true;
  
  // Institution admin has access to institution features and below
  if (roleStr === 'institution_admin') {
    return ['institution_admin', 'instructor', 'candidate', 'issuer', 'user'].includes(requiredStr);
  }
  
  // Instructor has access to instructor and candidate features
  if (roleStr === 'instructor') {
    return ['instructor', 'candidate', 'user'].includes(requiredStr);
  }
  
  // Candidate only has access to candidate features
  if (roleStr === 'candidate') {
    return ['candidate', 'user'].includes(requiredStr);
  }
  
  // Backward compatibility for old roles
  if (roleStr === 'admin') return true;
  if (roleStr === 'issuer') return ['issuer', 'user', 'instructor', 'candidate'].includes(requiredStr);
  if (roleStr === 'user') return requiredStr === 'user';
  
  return false;
};

// Helper function to get default path based on role
const getDefaultPathForRole = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return '/admin';
    case 'institution_admin':
      return '/institution';
    case 'instructor':
      return '/instructor';
    case 'candidate':
      return '/candidate/my-certificates';
    // Backward compatibility
    case 'admin':
      return '/admin';
    case 'issuer':
      return '/dashboard';
    case 'user':
      return '/dashboard/my-certificates';
    default:
      return '/';
  }
};

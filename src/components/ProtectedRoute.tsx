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
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  // Issuer has access to issuer and user features
  if (userRole === 'issuer' && (requiredRole === 'issuer' || requiredRole === 'user')) {
    return true;
  }
  
  // User only has access to user features
  if (userRole === 'user' && requiredRole === 'user') {
    return true;
  }
  
  return false;
};

// Helper function to get default path based on role
const getDefaultPathForRole = (role: UserRole): string => {
  switch (role) {
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

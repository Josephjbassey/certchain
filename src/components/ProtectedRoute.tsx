import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useUserRole, useHasRole } from '@/hooks/useUserRole';
import type { UserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { hasRole, isLoading: hasRoleLoading } = useHasRole(requiredRole || 'candidate');

  // Show loading state while checking auth and role
  if (authLoading || roleLoading || hasRoleLoading) {
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
  if (requiredRole) {
    if (!hasRole) {
      // Redirect based on actual role
      const redirectPath = getDefaultPathForRole(userRole || 'candidate');
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

// Helper function to get default path based on role
const getDefaultPathForRole = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return '/admin/dashboard';
    case 'institution_admin':
      return '/institution/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    case 'candidate':
      return '/candidate/dashboard';
    default:
      return '/';
  }
};

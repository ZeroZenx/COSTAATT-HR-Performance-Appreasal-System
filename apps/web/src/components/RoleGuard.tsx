import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { RBAC, Action, Resource, Context, UserRole } from '../lib/rbac';

interface RoleGuardProps {
  children: React.ReactNode;
  action: Action;
  resource: Resource;
  context?: Context;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Role-based access control component
 * Renders children only if user has permission
 */
export function RoleGuard({ 
  children, 
  action, 
  resource, 
  context = {}, 
  fallback = null,
  redirectTo 
}: RoleGuardProps) {
  const { user } = useAuth();

  const hasPermission = RBAC.can(user, action, resource, context);

  if (!hasPermission) {
    if (redirectTo) {
      // Redirect to specified route
      window.location.href = redirectTo;
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for role-based access
 */
export function withRole<T extends object>(
  Component: React.ComponentType<T>,
  requiredRole: UserRole | UserRole[]
) {
  return function RoleWrappedComponent(props: T) {
    const { user } = useAuth();
    
    const hasRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(user?.role as UserRole)
      : user?.role === requiredRole;

    if (!hasRole) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Hook for role-based permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  const can = (action: Action, resource: Resource, context?: Context) => {
    return RBAC.can(user, action, resource, context);
  };

  const canAccessRoute = (route: string) => {
    return RBAC.canAccessRoute(user, route);
  };

  const getDataScope = () => {
    return RBAC.getDataScope(user);
  };

  const getNavigationItems = () => {
    return RBAC.getNavigationItems(user);
  };

  const getDashboardWidgets = () => {
    return RBAC.getDashboardWidgets(user);
  };

  return {
    can,
    canAccessRoute,
    getDataScope,
    getNavigationItems,
    getDashboardWidgets,
    user,
    isEmployee: user?.role === UserRole.EMPLOYEE,
    isSupervisor: user?.role === UserRole.SUPERVISOR,
    isHRAdmin: user?.role === UserRole.HR_ADMIN,
  };
}

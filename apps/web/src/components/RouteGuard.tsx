import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from './RoleGuard';
import { Action, Resource } from '../lib/rbac';

interface RouteGuardProps {
  children: React.ReactNode;
  action: Action;
  resource: Resource;
  context?: any;
  redirectTo?: string;
}

/**
 * Route-level access control component
 * Redirects unauthorized users to a specified route
 */
export function RouteGuard({ 
  children, 
  action, 
  resource, 
  context = {}, 
  redirectTo = '/dashboard' 
}: RouteGuardProps) {
  const { can } = usePermissions();
  const location = useLocation();

  const hasPermission = can(action, resource, context);

  if (!hasPermission) {
    // Store the attempted route for potential redirect after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for route protection
 */
export function withRouteGuard<T extends object>(
  Component: React.ComponentType<T>,
  action: Action,
  resource: Resource,
  context?: any,
  redirectTo?: string
) {
  return function ProtectedRoute(props: T) {
    return (
      <RouteGuard action={action} resource={resource} context={context} redirectTo={redirectTo}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

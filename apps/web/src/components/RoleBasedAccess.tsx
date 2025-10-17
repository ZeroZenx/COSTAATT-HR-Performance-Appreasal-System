import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export function RoleBasedAccess({ children, allowedRoles, fallback = null }: RoleBasedAccessProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Helper hooks for role checking
export function useRole() {
  const { user } = useAuth();
  return user?.role || null;
}

export function useHasRole(role: string) {
  const { user } = useAuth();
  return user?.role === role;
}

export function useHasAnyRole(roles: string[]) {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}

// Role hierarchy helper
export function useCanAccess(requiredRole: string) {
  const { user } = useAuth();
  
  if (!user) return false;
  
  const roleHierarchy = {
    'EMPLOYEE': 1,
    'SUPERVISOR': 2,
    'FINAL_APPROVER': 3,
    'HR_ADMIN': 4
  };
  
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
}

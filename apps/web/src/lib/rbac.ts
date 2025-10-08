// Define UserRole enum locally to avoid import issues
export enum UserRole {
  HR_ADMIN = 'HR_ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  EMPLOYEE = 'EMPLOYEE',
  REVIEWER = 'REVIEWER',
}

export type User = {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  dept?: string;
  title?: string;
  managerId?: string | null;
};

export type Action = 
  | 'create' | 'view' | 'edit' | 'delete' 
  | 'submit' | 'approve' | 'reject' | 'finalize'
  | 'export' | 'import' | 'manage';

export type Resource = 
  | 'appraisal' | 'employee' | 'template' | 'cycle' 
  | 'competency' | 'report' | 'settings' | 'audit';

export type Context = {
  employeeId?: string;
  supervisorId?: string;
  scope?: 'self' | 'team' | 'org' | 'global';
  resourceId?: string;
  status?: string;
};

/**
 * Role-based access control utility
 * Implements the RBAC rules from the specification
 */
export class RBAC {
  /**
   * Check if a user can perform an action on a resource
   */
  static can(
    user: User | null, 
    action: Action, 
    resource: Resource, 
    context: Context = {}
  ): boolean {
    if (!user) return false;

    // HR_ADMIN has full access
    if (user.role === UserRole.HR_ADMIN) {
      return true;
    }

    // EMPLOYEE permissions
    if (user.role === UserRole.EMPLOYEE) {
      return this.canEmployee(user, action, resource, context);
    }

    // SUPERVISOR permissions
    if (user.role === UserRole.SUPERVISOR) {
      return this.canSupervisor(user, action, resource, context);
    }

    return false;
  }

  /**
   * EMPLOYEE role permissions
   */
  private static canEmployee(
    user: User, 
    action: Action, 
    resource: Resource, 
    context: Context
  ): boolean {
    // Employees can only access their own data
    if (context.employeeId && context.employeeId !== user.id) {
      return false;
    }

    switch (resource) {
      case 'appraisal':
        switch (action) {
          case 'view':
            return context.employeeId === user.id;
          case 'edit':
            // Can only edit self-assessment fields when status allows
            return context.employeeId === user.id && 
                   context.status === 'Self-Assessment';
          case 'submit':
            return context.employeeId === user.id;
          default:
            return false;
        }
      
      case 'employee':
        return false; // No access to employee directory
      
      case 'template':
      case 'cycle':
        return action === 'view'; // Read-only access
      
      case 'competency':
        return action === 'view'; // Read-only access
      
      case 'report':
        return false; // No access to reports
      
      case 'settings':
        return false; // No access to settings
      
      case 'audit':
        return false; // No access to audit logs
      
      default:
        return false;
    }
  }

  /**
   * SUPERVISOR role permissions
   */
  private static canSupervisor(
    user: User, 
    action: Action, 
    resource: Resource, 
    context: Context
  ): boolean {
    // Supervisors can only access their team's data
    if (context.scope === 'global') {
      return false;
    }

    switch (resource) {
      case 'appraisal':
        switch (action) {
          case 'create':
            return true; // Can create for their team
          case 'view':
          case 'edit':
            return context.scope === 'team' || context.supervisorId === user.id;
          case 'submit':
            return context.supervisorId === user.id;
          case 'finalize':
            return context.scope === 'global'; // Only HR_ADMIN can finalize
          default:
            return false;
        }
      
      case 'employee':
        return context.scope === 'team'; // Team directory only
      
      case 'template':
        return action === 'view'; // Read-only access
      
      case 'cycle':
        return action === 'view'; // Read-only access
      
      case 'competency':
        return action === 'view'; // Read-only access
      
      case 'report':
        return context.scope === 'team'; // Team reports only
      
      case 'settings':
        return false; // No access to global settings
      
      case 'audit':
        return false; // No access to audit logs
      
      default:
        return false;
    }
  }

  /**
   * Get navigation items based on user role
   */
  static getNavigationItems(user: User | null) {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' }
    ];

    switch (user.role) {
      case UserRole.EMPLOYEE:
        return [
          ...baseItems,
          { name: 'My Appraisals', href: '/appraisals', icon: 'FileText' },
          { name: 'My Profile', href: '/profile', icon: 'User' },
          { name: 'Help', href: '/help', icon: 'HelpCircle' }
        ];

      case UserRole.SUPERVISOR:
        return [
          ...baseItems,
          { name: 'Create New Appraisal', href: '/appraisals/new', icon: 'Plus' },
          { name: 'Appraisals', href: '/appraisals', icon: 'FileText' },
          { name: 'Employees', href: '/employees', icon: 'Users' },
          { name: 'Team Reports', href: '/reports', icon: 'BarChart3' },
          { name: 'Competencies', href: '/competencies', icon: 'Target' }
        ];

      case UserRole.HR_ADMIN:
        return [
          ...baseItems,
          { name: 'Create New Appraisal', href: '/appraisals/new', icon: 'Plus' },
          { name: 'Appraisals', href: '/appraisals', icon: 'FileText' },
          { name: 'Employees', href: '/employees', icon: 'Users' },
          { name: 'User Management', href: '/users', icon: 'User' },
          { name: 'Competencies', href: '/competencies', icon: 'Target' },
          { name: 'Reports', href: '/reports', icon: 'BarChart3' },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];

      default:
        return baseItems;
    }
  }

  /**
   * Get dashboard widgets based on user role
   */
  static getDashboardWidgets(user: User | null) {
    if (!user) return [];

    const baseWidgets = [
      { id: 'welcome', type: 'welcome', title: 'Welcome' }
    ];

    switch (user.role) {
      case UserRole.EMPLOYEE:
        return [
          ...baseWidgets,
          { id: 'my-appraisals', type: 'appraisal-stats', title: 'My Appraisals', scope: 'self' },
          { id: 'pending-actions', type: 'pending-actions', title: 'Pending Actions', scope: 'self' }
        ];

      case UserRole.SUPERVISOR:
        return [
          ...baseWidgets,
          { id: 'team-appraisals', type: 'appraisal-stats', title: 'Team Appraisals', scope: 'team' },
          { id: 'quick-actions', type: 'quick-actions', title: 'Quick Actions', scope: 'team' },
          { id: 'pending-signatures', type: 'pending-signatures', title: 'Pending Signatures', scope: 'team' }
        ];

      case UserRole.HR_ADMIN:
        return [
          ...baseWidgets,
          { id: 'total-appraisals', type: 'appraisal-stats', title: 'Total Appraisals', scope: 'global' },
          { id: 'cycle-status', type: 'cycle-status', title: 'Cycle Status', scope: 'global' },
          { id: 'data-quality', type: 'data-quality', title: 'Data Quality Alerts', scope: 'global' },
          { id: 'overdue-counts', type: 'overdue-counts', title: 'Overdue Counts', scope: 'global' }
        ];

      default:
        return baseWidgets;
    }
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user: User | null, route: string): boolean {
    if (!user) return false;

    // Dashboard is accessible to all authenticated users
    if (route === '/dashboard') return true;

    switch (user.role) {
      case UserRole.EMPLOYEE:
        return [
          '/appraisals',
          '/profile',
          '/help'
        ].some(allowedRoute => route.startsWith(allowedRoute));

      case UserRole.SUPERVISOR:
        return [
          '/appraisals',
          '/employees',
          '/reports',
          '/competencies'
        ].some(allowedRoute => route.startsWith(allowedRoute));

      case UserRole.HR_ADMIN:
        return [
          '/appraisals',
          '/employees',
          '/users',
          '/competencies',
          '/reports',
          '/settings'
        ].some(allowedRoute => route.startsWith(allowedRoute));

      default:
        return false;
    }
  }

  /**
   * Get user's data scope for API calls
   */
  static getDataScope(user: User | null): Context {
    if (!user) return { scope: 'self' };

    switch (user.role) {
      case UserRole.EMPLOYEE:
        return { scope: 'self', employeeId: user.id };
      
      case UserRole.SUPERVISOR:
        return { scope: 'team', supervisorId: user.id };
      
      case UserRole.HR_ADMIN:
        return { scope: 'global' };
      
      default:
        return { scope: 'self' };
    }
  }
}

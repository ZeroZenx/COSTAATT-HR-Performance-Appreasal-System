import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RoleBasedAccess } from './RoleBasedAccess';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Users, 
  User, 
  Target, 
  BarChart3, 
  Database, 
  Settings,
  File,
  Mail,
  UserCheck,
  MessageCircle,
  Lock,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE', 'SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
      { path: '/profile', label: 'My Profile', icon: UserCheck, roles: ['EMPLOYEE', 'SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
      { path: '/appraisals', label: 'My Appraisals', icon: FileText, roles: ['EMPLOYEE', 'SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
      { path: '/self-evaluation', label: 'Self-Evaluation', icon: MessageCircle, roles: ['EMPLOYEE', 'SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
      { path: '/self-evaluation/history', label: 'Self-Evaluation History', icon: File, roles: ['EMPLOYEE', 'SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
      { path: '/change-password', label: 'Change Password', icon: Lock, roles: ['EMPLOYEE', 'SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
    ];

           if (user?.role === 'EMPLOYEE') {
             return baseItems;
           }

          if (user?.role === 'SUPERVISOR') {
            return [
              ...baseItems,
              { path: '/appraisals/new', label: 'Create New Appraisal', icon: Plus, roles: ['SUPERVISOR', 'HR_ADMIN'] },
              { path: '/team-appraisals', label: 'Team Appraisals', icon: FileText, roles: ['SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
              { path: '/team-management', label: 'My Team', icon: Users, roles: ['SUPERVISOR', 'HR_ADMIN'] },
              { path: '/reports', label: 'Team Reports', icon: BarChart3, roles: ['SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
            ];
          }

          // HR_ADMIN with supervisor capabilities (like Darren Headley)
          if (user?.role === 'HR_ADMIN' && user?.email === 'dheadley@costaatt.edu.tt') {
            return [
              ...baseItems,
              { path: '/appraisals/new', label: 'Create New Appraisal', icon: Plus, roles: ['SUPERVISOR', 'HR_ADMIN'] },
              { path: '/appraisals', label: 'Team Appraisals', icon: FileText, roles: ['SUPERVISOR', 'FINAL_APPROVER', 'HR_ADMIN'] },
              { path: '/team-management', label: 'My Team', icon: Users, roles: ['SUPERVISOR', 'HR_ADMIN'] },
              { path: '/templates', label: 'Templates', icon: File, roles: ['HR_ADMIN'] },
              { path: '/employees', label: 'Employees', icon: Users, roles: ['HR_ADMIN'] },
              { path: '/competencies', label: 'Competencies', icon: Target, roles: ['HR_ADMIN'] },
              { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['FINAL_APPROVER', 'HR_ADMIN'] },
              { path: '/admin/password-management', label: 'Password Management', icon: Shield, roles: ['HR_ADMIN'] },
              { path: '/settings', label: 'Settings', icon: Settings, roles: ['HR_ADMIN'] },
            ];
          }

           // Admin and Final Approver menu
           return [
             ...baseItems,
             { path: '/appraisals/new', label: 'Create New Appraisal', icon: Plus, roles: ['SUPERVISOR', 'HR_ADMIN'] },
             { path: '/appraisals', label: 'All Appraisals', icon: FileText, roles: ['FINAL_APPROVER', 'HR_ADMIN'] },
             { path: '/team-management', label: 'My Team', icon: Users, roles: ['SUPERVISOR', 'HR_ADMIN'] },
             { path: '/templates', label: 'Templates', icon: File, roles: ['HR_ADMIN'] },
             { path: '/employees', label: 'Employees', icon: Users, roles: ['HR_ADMIN'] },
            { path: '/competencies', label: 'Competencies', icon: Target, roles: ['HR_ADMIN'] },
            { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['FINAL_APPROVER', 'HR_ADMIN'] },
            { path: '/admin/password-management', label: 'Password Management', icon: Shield, roles: ['HR_ADMIN'] },
             { path: '/settings', label: 'Settings', icon: Settings, roles: ['HR_ADMIN'] },
           ];
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 sm:w-80 lg:w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full max-h-screen min-h-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <div className="ml-3 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-900 leading-none">COSTAATT</h2>
                <p className="text-sm text-gray-500 leading-none mt-0.5">HR Gateway</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {menuItems.map((item) => (
              <RoleBasedAccess
                key={item.path}
                allowedRoles={item.roles}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(item.path)
                      ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </RoleBasedAccess>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-gray-500 text-center">
              COSTAATT HR Performance Gateway
              <br />
              Version 1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import { NavLink } from 'react-router-dom';
import { usePermissions } from './RoleGuard';
import {
  LayoutDashboard,
  FileText,
  Users,
  Target,
  BarChart3,
  Plus,
  User,
  HelpCircle,
  Settings,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';

const iconMap = {
  LayoutDashboard,
  FileText,
  Users,
  Target,
  BarChart3,
  Plus,
  User,
  HelpCircle,
  Settings,
  Database
};

export function Sidebar() {
  const { getNavigationItems } = usePermissions();
  
  // Get navigation items based on user role
  const navigation = getNavigationItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HR</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Performance</span>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}


import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import NotificationBell from './NotificationBell';

export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-gray-900 leading-none">HR Performance Gateway</h1>
            <p className="text-sm text-gray-500 leading-none mt-0.5">Performance Management System</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
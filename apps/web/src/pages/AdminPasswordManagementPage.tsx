import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { RoleBasedAccess } from '../components/RoleBasedAccess';
import { 
  Users, 
  Lock, 
  Search, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  User,
  Mail,
  Building
} from 'lucide-react';

export function AdminPasswordManagementPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch all users for admin management
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      console.log('Token for users request:', token ? 'Present' : 'Missing');
      
      const response = await fetch('http://10.2.1.27:3000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch users:', response.status, errorData);
        throw new Error(`Failed to fetch users: ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      console.log('Users data loaded:', data);
      // Handle both array format and object format
      return Array.isArray(data) ? data : (data.data || []);
    },
    enabled: user?.role === 'HR_ADMIN' || user?.roles?.includes('HR_ADMIN')
  });

  const filteredUsers = users.filter((user: any) => {
    if (!searchTerm) return true; // Show all users if no search term
    
    const searchLower = searchTerm.toLowerCase();
    const matches = (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.dept?.toLowerCase().includes(searchLower) ||
      user.title?.toLowerCase().includes(searchLower)
    );
    
    console.log(`Searching for "${searchTerm}" in user:`, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      matches
    });
    
    return matches;
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const resetUserPassword = async () => {
    if (!selectedUser || !newPassword) {
      setMessage({ type: 'error', text: 'Please select a user and enter a new password' });
      return;
    }

    setIsResetting(true);
    setMessage(null);

    try {
      const response = await fetch(`http://10.2.1.27:3000/admin/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: `Password reset successfully for ${selectedUser.firstName} ${selectedUser.lastName}` });
        setNewPassword('');
        setSelectedUser(null);
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred while resetting password' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <RoleBasedAccess allowedRoles={['HR_ADMIN']}>
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Password Management</h1>
              <p className="mt-2 text-gray-600">Reset passwords for staff members</p>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      message.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Staff Members</h3>
                    <p className="text-sm text-gray-500">
                      {isLoading ? 'Loading...' : `${filteredUsers.length} of ${users.length} users`}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4">
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 text-xs text-gray-500">
                        Search term: "{searchTerm}" | Total users: {users.length} | Filtered: {filteredUsers.length}
                      </div>
                    )}
                  </div>

                  {/* Users List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading users...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-600 mb-2">Failed to load users</p>
                        <p className="text-sm text-gray-500">{error.message}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                        >
                          Try again
                        </button>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {searchTerm ? 'No users match your search' : 'No users found'}
                        </p>
                      </div>
                    ) : (
                      filteredUsers.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedUser?.id === user.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center mt-1">
                                <Building className="w-3 h-3 mr-1" />
                                {user.role} • {user.dept}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Password Reset Panel */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
                </div>
                <div className="px-6 py-4">
                  {selectedUser ? (
                    <div className="space-y-6">
                      {/* Selected User Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900">
                              {selectedUser.firstName} {selectedUser.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            <p className="text-xs text-gray-400">{selectedUser.role} • {selectedUser.dept}</p>
                          </div>
                        </div>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={generateRandomPassword}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Click the refresh button to generate a secure random password
                        </p>
                      </div>

                      {/* Reset Button */}
                      <div>
                        <button
                          onClick={resetUserPassword}
                          disabled={isResetting || !newPassword}
                          className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isResetting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Resetting Password...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Reset Password
                            </>
                          )}
                        </button>
                      </div>

                      {/* Warning */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                          <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Warning:</strong> This action will immediately reset the user's password. 
                              They will need to use this new password to log in.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Select a User</h4>
                      <p className="text-gray-500">
                        Choose a staff member from the list to reset their password
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RoleBasedAccess>
  );
}

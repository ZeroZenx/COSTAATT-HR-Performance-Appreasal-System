import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2, Plus, Key, AlertCircle, Users, UserCheck, UserX, Lock, Edit, Trash2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  authProvider: 'SSO' | 'LOCAL';
  active: boolean;
  mustChangePassword: boolean;
  title?: string;
  dept?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
  mustChangePassword: boolean;
}

interface ResetPasswordData {
  password: string;
}

interface EditUserData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  title: string;
  dept: string;
}

export default function UserManagementPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserData>({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    password: '',
    mustChangePassword: false
  });
  const [resetForm, setResetForm] = useState<ResetPasswordData>({
    password: ''
  });
  const [editForm, setEditForm] = useState<EditUserData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    title: '',
    dept: ''
  });
  const [error, setError] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, error: fetchError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const result = await response.json();
      return result as User[];
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      try {
        const response = await fetch('http://10.2.1.27:3000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('Error response:', error);
          throw new Error(error.message || 'Failed to create user');
        }
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateForm(false);
      setCreateForm({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        password: '',
        mustChangePassword: false
      });
      setError('');
    },
    onError: (error: Error) => {
      console.error('Create user error:', error);
      setError(error.message);
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const response = await fetch(`http://10.2.1.27:3000/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowResetForm(false);
      setResetForm({ password: '' });
      setSelectedUserId('');
      setError('');
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`http://10.2.1.27:3000/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to toggle user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: EditUserData }) => {
      const response = await fetch(`http://10.2.1.27:3000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditForm(false);
      setSelectedUser(null);
      setEditForm({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        title: '',
        dept: ''
      });
      setError('');
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`http://10.2.1.27:3000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleCreateUser = () => {
    if (!createForm.email || !createForm.firstName || !createForm.lastName || !createForm.role || !createForm.password) {
      setError('All fields are required');
      return;
    }
    createUserMutation.mutate(createForm);
  };

  const handleResetPassword = () => {
    if (!resetForm.password) {
      setError('Password is required');
      return;
    }
    resetPasswordMutation.mutate({ userId: selectedUserId, password: resetForm.password });
  };

  const openResetForm = (userId: string) => {
    setSelectedUserId(userId);
    setShowResetForm(true);
  };

  const openEditForm = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      title: user.title || '',
      dept: user.dept || ''
    });
    setShowEditForm(true);
  };

  const handleEditUser = () => {
    if (!selectedUser || !editForm.firstName || !editForm.lastName || !editForm.email || !editForm.role) {
      setError('All required fields must be filled');
      return;
    }
    editUserMutation.mutate({ userId: selectedUser.id, userData: editForm });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">
                Error loading users: {fetchError.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={true} onClose={() => {}} />
      <div className="flex-1 flex flex-col">
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
      <div className="flex justify-between items-center sticky top-0 bg-white z-30 pb-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage local user accounts and authentication</p>
        </div>
        <Button onClick={() => {
          setShowCreateForm(!showCreateForm);
          setError(''); // Clear any previous errors
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Local User
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Local User</CardTitle>
            <CardDescription>
              Create a new local user account with email and password authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="john.doe@costaatt.edu.tt"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={createForm.role} onValueChange={(value) => setCreateForm({ ...createForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR_ADMIN">HR Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Enter temporary password"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Must be at least 10 characters with letters and numbers
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mustChangePassword"
                  checked={createForm.mustChangePassword}
                  onChange={(e) => setCreateForm({ ...createForm, mustChangePassword: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="mustChangePassword">Require password change at first login</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Administrators Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2 text-purple-600" />
            Administrators ({users?.filter(u => u.role === 'HR_ADMIN').length || 0})
          </CardTitle>
          <CardDescription>
            System administrators with full access to all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.filter(user => user.role === 'HR_ADMIN').map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-purple-50">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                      <Badge variant="default" className="bg-purple-600">HR_ADMIN</Badge>
                      <Badge variant={user.authProvider === 'LOCAL' ? 'default' : 'secondary'}>
                        {user.authProvider}
                      </Badge>
                      {user.mustChangePassword && (
                        <Badge variant="destructive">Must Change Password</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.active ? 'default' : 'secondary'}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatusMutation.mutate(user.id)}
                      disabled={toggleStatusMutation.isPending}
                      className={user.active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                    >
                      {user.active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {user.authProvider === 'LOCAL' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResetForm(user.id)}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Reset Password
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                      disabled={deleteUserMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {users?.filter(u => u.role === 'HR_ADMIN').length === 0 && (
              <p className="text-gray-500 text-center py-4">No administrators found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supervisors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Supervisors ({users?.filter(u => u.role === 'SUPERVISOR').length || 0})
          </CardTitle>
          <CardDescription>
            Supervisors and managers with team management access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.filter(user => user.role === 'SUPERVISOR').map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                      <Badge variant="default" className="bg-blue-600">SUPERVISOR</Badge>
                      <Badge variant={user.authProvider === 'LOCAL' ? 'default' : 'secondary'}>
                        {user.authProvider}
                      </Badge>
                      {user.mustChangePassword && (
                        <Badge variant="destructive">Must Change Password</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.active ? 'default' : 'secondary'}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatusMutation.mutate(user.id)}
                      disabled={toggleStatusMutation.isPending}
                      className={user.active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                    >
                      {user.active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {user.authProvider === 'LOCAL' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResetForm(user.id)}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Reset Password
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                      disabled={deleteUserMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {users?.filter(u => u.role === 'SUPERVISOR').length === 0 && (
              <p className="text-gray-500 text-center py-4">No supervisors found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Approvers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Final Approvers ({users?.filter(u => u.role === 'FINAL_APPROVER').length || 0})
          </CardTitle>
          <CardDescription>
            Final approvers with authority to make final recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.filter(user => user.role === 'FINAL_APPROVER').map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                      <Badge variant="default" className="bg-green-600">FINAL_APPROVER</Badge>
                      <Badge variant={user.authProvider === 'LOCAL' ? 'default' : 'secondary'}>
                        {user.authProvider}
                      </Badge>
                      {user.mustChangePassword && (
                        <Badge variant="destructive">Must Change Password</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.active ? 'default' : 'secondary'}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatusMutation.mutate(user.id)}
                      disabled={toggleStatusMutation.isPending}
                      className={user.active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                    >
                      {user.active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {user.authProvider === 'LOCAL' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResetForm(user.id)}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Reset Password
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                      disabled={deleteUserMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {users?.filter(u => u.role === 'FINAL_APPROVER').length === 0 && (
              <p className="text-gray-500 text-center py-4">No final approvers found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Regular Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Regular Users ({users?.filter(u => u.role === 'EMPLOYEE').length || 0})</CardTitle>
          <CardDescription>
            Manage local and SSO user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.filter(user => user.role === 'EMPLOYEE').map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                      <Badge variant={user.authProvider === 'LOCAL' ? 'default' : 'secondary'}>
                        {user.authProvider}
                      </Badge>
                      {user.mustChangePassword && (
                        <Badge variant="destructive">Must Change Password</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.active ? 'default' : 'secondary'}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatusMutation.mutate(user.id)}
                      disabled={toggleStatusMutation.isPending}
                      className={user.active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                    >
                      {user.active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {user.authProvider === 'LOCAL' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResetForm(user.id)}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Reset Password
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                      disabled={deleteUserMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Form */}
      {showResetForm && (
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Set a new password for this user. They will be required to change it on next login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={resetForm.password}
                  onChange={(e) => setResetForm({ password: e.target.value })}
                  placeholder="Enter new password"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Must be at least 10 characters with letters and numbers
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowResetForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleResetPassword} disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Reset Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit User Form */}
      {showEditForm && selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
            <CardDescription>
              Update user information for {selectedUser.firstName} {selectedUser.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editRole">Role</Label>
                  <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                      <SelectItem value="FINAL_APPROVER">Final Approver</SelectItem>
                      <SelectItem value="HR_ADMIN">HR Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editDept">Department</Label>
                  <Input
                    id="editDept"
                    value={editForm.dept}
                    onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editTitle">Job Title</Label>
                <Input
                  id="editTitle"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Enter job title"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditUser} disabled={editUserMutation.isPending}>
                  {editUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </main>
      </div>
    </div>
  );
}

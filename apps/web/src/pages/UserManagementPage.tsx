import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2, Plus, Key, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  authProvider: 'SSO' | 'LOCAL';
  active: boolean;
  mustChangePassword: boolean;
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

export default function UserManagementPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
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
  const [error, setError] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, error: fetchError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const result = await response.json();
      return result.data as User[];
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/users', {
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
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/password`, {
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
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/status`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to toggle user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
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

      <Card>
        <CardHeader>
          <CardTitle>Users ({users?.length || 0})</CardTitle>
          <CardDescription>
            Manage local and SSO user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => (
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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Active</span>
                    <input
                      type="checkbox"
                      checked={user.active}
                      onChange={() => toggleStatusMutation.mutate(user.id)}
                      disabled={toggleStatusMutation.isPending}
                      className="rounded"
                    />
                  </div>
                  {user.authProvider === 'LOCAL' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResetForm(user.id)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                  )}
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
    </div>
  );
}

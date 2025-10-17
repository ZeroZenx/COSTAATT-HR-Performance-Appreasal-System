import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  Mail, 
  Building,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Employee {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    dept: string;
    active: boolean;
  };
  supervisorId: string | null;
  createdAt: string;
}

interface AvailableEmployee {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    dept: string;
    active: boolean;
  };
}

export function TeamManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [error, setError] = useState('');

  // Fetch current team members
  const { data: teamMembers = [], isLoading: teamLoading } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`http://10.2.1.27:3000/employees/supervisor/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!user?.id
  });

  // Fetch available employees (not already assigned to supervisors)
  const { data: availableEmployees = [], isLoading: availableLoading } = useQuery({
    queryKey: ['available-employees'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/employees/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch available employees');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: showAddForm
  });

  // Add team member mutation
  const addTeamMemberMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await fetch(`http://10.2.1.27:3000/employees/${employeeId}/assign-supervisor`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ supervisorId: user?.id })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add team member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['available-employees'] });
      setShowAddForm(false);
      setSelectedEmployee('');
      setError('');
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await fetch(`http://10.2.1.27:3000/employees/${employeeId}/remove-supervisor`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove team member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['available-employees'] });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleAddTeamMember = () => {
    if (!selectedEmployee) {
      setError('Please select an employee to add to your team');
      return;
    }
    addTeamMemberMutation.mutate(selectedEmployee);
  };

  const handleRemoveTeamMember = (employeeId: string) => {
    if (window.confirm('Are you sure you want to remove this employee from your team?')) {
      removeTeamMemberMutation.mutate(employeeId);
    }
  };

  const filteredAvailableEmployees = availableEmployees.filter((emp: AvailableEmployee) =>
    emp.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 sticky top-0 bg-white z-30 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="mt-2 text-gray-600">Manage your team members and assign employees to your supervision</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  My Team ({teamMembers.length})
                </CardTitle>
                <CardDescription>
                  Employees currently under your supervision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">Loading team members...</p>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
                      <p className="text-gray-500">Start building your team by adding employees</p>
                      <Button 
                        onClick={() => setShowAddForm(true)}
                        className="mt-4"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Team Member
                      </Button>
                    </div>
                  ) : (
                    teamMembers.map((member: Employee) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">
                                {member.user.firstName} {member.user.lastName}
                              </h3>
                              <Badge variant={member.user.active ? 'default' : 'secondary'}>
                                {member.user.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {member.user.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Building className="w-3 h-3 mr-1" />
                              {member.user.title} • {member.user.dept}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          disabled={removeTeamMemberMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Team Member */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                  Add Team Member
                </CardTitle>
                <CardDescription>
                  Assign employees to your supervision
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showAddForm ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Add Team Members</h3>
                    <p className="text-gray-500 mb-4">Select employees to add to your team</p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Start Adding
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search */}
                    <div>
                      <Label htmlFor="search">Search Employees</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <Input
                          id="search"
                          placeholder="Search by name, email, or title..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Available Employees List */}
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      {availableLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Loading employees...</p>
                        </div>
                      ) : filteredAvailableEmployees.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            {searchTerm ? 'No employees match your search' : 'No available employees'}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredAvailableEmployees.map((employee: AvailableEmployee) => (
                            <div
                              key={employee.id}
                              onClick={() => setSelectedEmployee(employee.id)}
                              className={`p-3 cursor-pointer transition-colors ${
                                selectedEmployee === employee.id
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <UserCheck className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {employee.user.firstName} {employee.user.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {employee.user.title} • {employee.user.dept}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {employee.user.email}
                                  </div>
                                </div>
                                {selectedEmployee === employee.id && (
                                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddForm(false);
                          setSelectedEmployee('');
                          setSearchTerm('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddTeamMember}
                        disabled={!selectedEmployee || addTeamMemberMutation.isPending}
                      >
                        {addTeamMemberMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add to Team
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Statistics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{teamMembers.length}</div>
                  <div className="text-sm text-gray-500">Total Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {teamMembers.filter((m: Employee) => m.user.active).length}
                  </div>
                  <div className="text-sm text-gray-500">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {availableEmployees.length}
                  </div>
                  <div className="text-sm text-gray-500">Available Employees</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

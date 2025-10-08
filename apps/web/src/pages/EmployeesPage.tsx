import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Plus, Search, Filter, Eye, Edit, MoreHorizontal, Grid3X3, List, User } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '../components/RoleGuard';

export function EmployeesPage() {
  const { getDataScope, isSupervisor, isHRAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Check if user has permission to view employees
  if (!isSupervisor && !isHRAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view employee directory.</p>
        </div>
      </div>
    );
  }

  const dataScope = getDataScope();
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees', dataScope],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      return response.json();
    },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/employees/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error loading employees: {error.message}</p>
        </div>
      </div>
    );
  }

  // Filter employees based on search term and department
  const filteredEmployees = employees?.filter(employee => {
    const user = employee.user;
    const matchesSearch = !searchTerm || 
      user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id?.toString().includes(searchTerm);
    
    const matchesDepartment = !filterDepartment || 
      employee.dept === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  }) || [];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSupervisor ? 'Team Members' : 'Employees'}
          </h1>
          <p className="text-gray-600">
            {isSupervisor ? 'Manage your team members' : 'Manage employee records and information'}
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments?.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Display */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'card' ? (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEmployees.map((employee, index) => (
                <div key={employee.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {employee.user?.firstName} {employee.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{employee.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1 flex-shrink-0 ml-2">
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Role</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        employee.user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        employee.user?.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {employee.user?.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Department</span>
                      <span className="text-gray-900 text-xs truncate max-w-[120px]" title={employee.dept || 'N/A'}>
                        {employee.dept || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Status</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        employee.user?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.user?.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    {employee.supervisor?.firstName && employee.supervisor?.lastName && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Supervisor</span>
                        <span className="text-gray-900 text-xs truncate max-w-[120px]" title={`${employee.supervisor.firstName} ${employee.supervisor.lastName}`}>
                          {employee.supervisor.firstName} {employee.supervisor.lastName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Table View - Optimized for better responsiveness
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-32">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-48">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-24">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-32">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-24">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee, index) => (
                    <tr key={employee.id || index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.user?.firstName} {employee.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {employee.id?.slice(-8) || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div className="truncate max-w-[200px]" title={employee.user?.email}>
                          {employee.user?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          employee.user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          employee.user?.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {employee.user?.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="truncate max-w-[120px]" title={employee.dept || 'N/A'}>
                          {employee.dept || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          employee.user?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.user?.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="More Options">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {employees?.length === 0 
                  ? 'No employees found in the system.' 
                  : 'No employees found matching your criteria.'}
              </p>
              {employees?.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Try importing employee data or contact your administrator.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


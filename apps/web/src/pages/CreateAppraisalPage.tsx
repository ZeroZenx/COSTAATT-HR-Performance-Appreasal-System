import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { ArrowLeft, Plus, Users, Calendar, Search, X, Check, AlertTriangle } from 'lucide-react';
import { employeesApi, appraisalInstancesApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../components/RoleGuard';
import { useAuth } from '../hooks/useAuth';

export function CreateAppraisalPage() {
  const navigate = useNavigate();
  const { isSupervisor, isHRAdmin } = usePermissions();
  const { user } = useAuth();
  
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [options, setOptions] = useState({
    selfAssessment: false,
    peerFeedback: false,
    studentEvaluations: false,
    projectsEnabled: false,
  });
  const [showTemplateOverride, setShowTemplateOverride] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll().then(res => {
      // Handle direct response (not wrapped in data field)
      return Array.isArray(res.data) ? res.data : [];
    }),
  });

  const { data: cycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => appraisalInstancesApi.getCycles().then(res => {
      return Array.isArray(res.data) ? res.data : [];
    }),
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => appraisalInstancesApi.getTemplates().then(res => {
      return Array.isArray(res.data) ? res.data : [];
    }),
  });

  // Get selected employee details
  const selectedEmployeeData = employees?.find(emp => emp.id === selectedEmployee);

  // Auto-select template based on employee category
  useEffect(() => {
    if (selectedEmployeeData && templates) {
      const employeeCategory = selectedEmployeeData.employmentCategory;
      const matchingTemplate = templates.find(template => {
        switch (employeeCategory) {
          case 'DEAN':
            return template.type === 'DEAN';
          case 'FACULTY':
            return template.type === 'FACULTY';
          case 'CLINICAL':
            return template.type === 'CLINICAL';
          case 'GENERAL_STAFF':
            return template.type === 'GENERAL_STAFF';
          case 'EXECUTIVE':
            return template.type === 'EXECUTIVE';
          default:
            return false;
        }
      });

      if (matchingTemplate && !selectedTemplate) {
        setSelectedTemplate(matchingTemplate.id);
      }
    }
  }, [selectedEmployeeData, templates, selectedTemplate]);

  // Check for template override when template is manually changed
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (selectedEmployeeData && templates) {
      const employeeCategory = selectedEmployeeData.employmentCategory;
      const selectedTemplateData = templates.find(t => t.id === templateId);
      
      if (selectedTemplateData) {
        const isMatchingCategory = 
          (employeeCategory === 'DEAN' && selectedTemplateData.type === 'DEAN') ||
          (employeeCategory === 'FACULTY' && selectedTemplateData.type === 'FACULTY') ||
          (employeeCategory === 'CLINICAL' && selectedTemplateData.type === 'CLINICAL') ||
          (employeeCategory === 'GENERAL_STAFF' && selectedTemplateData.type === 'GENERAL_STAFF') ||
          (employeeCategory === 'EXECUTIVE' && selectedTemplateData.type === 'EXECUTIVE');
        
        setShowTemplateOverride(!isMatchingCategory);
      }
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employees?.filter(employee => {
    if (!employeeSearch) return true;
    const user = employee.user;
    const searchTerm = employeeSearch.toLowerCase();
    return (
      user?.firstName?.toLowerCase().includes(searchTerm) ||
      user?.lastName?.toLowerCase().includes(searchTerm) ||
      user?.email?.toLowerCase().includes(searchTerm) ||
      employee.division?.toLowerCase().includes(searchTerm)
    );
  }) || [];

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    setShowEmployeeDropdown(false);
    setEmployeeSearch('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateAppraisal = async () => {
    if (!selectedEmployee || !selectedTemplate || !selectedCycle) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      alert('You must be logged in to create appraisals');
      return;
    }

    try {
      // Create appraisal instance
      const response = await appraisalInstancesApi.create({
        employeeId: selectedEmployee,
        templateId: selectedTemplate,
        cycleId: selectedCycle,
        createdBy: user?.id || '',
        options: options,
      });


      // Navigate to appraisal builder
      const appraisalId = (response.data as any)?.data?.id || (response.data as any)?.id;

      if (appraisalId) {
        navigate(`/appraisals/${appraisalId}`);
      } else {
        console.error('❌ No appraisal ID in response:', response.data);
        alert('Failed to get appraisal ID from response. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Error creating appraisal instance:', error);

      // More specific error messages
      if (error.response?.status === 401) {
        alert('Authentication required. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to create appraisals.');
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to create appraisal. Please try again.');
      }
    }
  };

  if (employeesLoading || cyclesLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user has permission to create appraisals
  if (!isSupervisor && !isHRAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to create appraisals.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Appraisal</h1>
          <p className="text-gray-600">Start a new performance appraisal process</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Appraisal Details</span>
          </CardTitle>
          <CardDescription>
            Select the employee and appraisal parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee *</Label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="employee"
                    placeholder="Search employees by name, email, or department..."
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setShowEmployeeDropdown(true);
                    }}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    className="pl-10 pr-10"
                  />
                  {selectedEmployee && (
                    <button
                      onClick={() => {
                        setSelectedEmployee('');
                        setEmployeeSearch('');
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Selected Employee Display */}
                {selectedEmployeeData && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">
                            {selectedEmployeeData.user?.firstName} {selectedEmployeeData.user?.lastName}
                          </p>
                          <p className="text-sm text-blue-700">{selectedEmployeeData.user?.email}</p>
                          <p className="text-xs text-blue-600">{selectedEmployeeData.division}</p>
                        </div>
                      </div>
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                )}

                {/* Employee Dropdown */}
                {showEmployeeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <button
                          key={employee.id}
                          onClick={() => handleEmployeeSelect(employee.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {employee.user?.firstName} {employee.user?.lastName}
                              </p>
                              <p className="text-sm text-gray-600 truncate">{employee.user?.email}</p>
                              <p className="text-xs text-gray-500">{employee.division}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500">
                        No employees found matching your search
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Appraisal Template */}
            <div className="space-y-2">
              <Label htmlFor="template">Appraisal Template *</Label>
              <select
                id="template"
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={templatesLoading}
              >
                <option value="">Select template...</option>
                {templates?.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.displayName || template.name}
                  </option>
                ))}
              </select>

              {/* Template Override Banner */}
              {showTemplateOverride && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Template differs from employee category
                      </p>
                      <p className="text-xs text-yellow-700">
                        The selected template doesn't match the employee's category. Proceed with caution.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Appraisal Cycle */}
            <div className="space-y-2">
              <Label htmlFor="cycle">Appraisal Cycle *</Label>
              <select
                id="cycle"
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={cyclesLoading}
              >
                <option value="">Select cycle...</option>
                {cycles?.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Options */}
            <div className="space-y-2">
              <Label>Additional Options</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={options.selfAssessment}
                    onChange={(e) => setOptions(prev => ({ ...prev, selfAssessment: e.target.checked }))}
                  />
                  <span className="text-sm">Include self-assessment</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={options.peerFeedback}
                    onChange={(e) => setOptions(prev => ({ ...prev, peerFeedback: e.target.checked }))}
                  />
                  <span className="text-sm">Include peer feedback</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={options.studentEvaluations}
                    onChange={(e) => setOptions(prev => ({ ...prev, studentEvaluations: e.target.checked }))}
                  />
                  <span className="text-sm">Include student evaluations</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={options.projectsEnabled}
                    onChange={(e) => setOptions(prev => ({ ...prev, projectsEnabled: e.target.checked }))}
                  />
                  <span className="text-sm">Enable projects section</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAppraisal} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Appraisal</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cycles</p>
                <p className="text-2xl font-bold text-gray-900">{cycles?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Plus className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
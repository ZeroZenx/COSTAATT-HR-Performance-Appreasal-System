import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { CompetencySelector } from '../components/CompetencySelector';
import { Plus, Users, Calendar, Search, X, Check, ChevronDown } from 'lucide-react';

export function CreateAppraisalPage() {
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [createdAppraisalId, setCreatedAppraisalId] = useState<string | null>(null);
  const [showCompetencySelector, setShowCompetencySelector] = useState(false);
  const [options, setOptions] = useState({
    selfAssessment: false,
    peerFeedback: false,
    studentEvaluations: false,
    projectsEnabled: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/employees');
      return response.json();
    }
  });

  const { data: cycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/cycles');
      const data = await response.json();
      // Sort cycles by start date descending (most recent first)
      return data.sort((a: any, b: any) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime());
    }
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/templates');
      return response.json();
    }
  });

  // Get selected employee details
  const selectedEmployeeData = employees?.find((emp: any) => emp.id === selectedEmployee);

  // Filter employees based on search term
  const filteredEmployees = employees?.filter((employee: any) => {
    if (!employeeSearch) return true;
    const searchTerm = employeeSearch.toLowerCase();
    return (
      employee.firstName?.toLowerCase().includes(searchTerm) ||
      employee.lastName?.toLowerCase().includes(searchTerm) ||
      employee.email?.toLowerCase().includes(searchTerm) ||
      employee.dept?.toLowerCase().includes(searchTerm)
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

  // Refresh cycles when window regains focus (in case a new cycle was created)
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient]);

  const handleCreateAppraisal = async () => {
    if (!selectedEmployee || !selectedTemplate || !selectedCycle) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Get the template type from the selected template
      const selectedTemplateData = templates?.find((template: any) => template.id === selectedTemplate);
      const selectedCycleData = cycles?.find((cycle: any) => cycle.id === selectedCycle);
      
      if (!selectedTemplateData) {
        alert('Selected template not found');
        return;
      }

      if (!selectedCycleData) {
        alert('Selected cycle not found');
        return;
      }

      // Check if cycle is active
      const now = new Date();
      const cycleStart = new Date(selectedCycleData.periodStart);
      const cycleEnd = new Date(selectedCycleData.periodEnd);
      
      if (now < cycleStart || now > cycleEnd) {
        alert('Selected appraisal cycle is not currently active. Please select an active cycle.');
        return;
      }

      // Check if appraisal already exists for this employee and cycle
      const existingCheck = await fetch(`http://10.2.1.27:3000/api/appraisals/check-existing/${selectedEmployee}/${selectedCycle}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (existingCheck.ok) {
        const existingData = await existingCheck.json();
        if (existingData.exists) {
          alert('An appraisal already exists for this employee in the selected cycle. Please choose a different employee or cycle.');
          return;
        }
      }

      // Create appraisal instance using the enhanced endpoint
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://10.2.1.27:3000/appraisals', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          employeeId: selectedEmployee,
          templateType: selectedTemplateData?.type,
          cycleId: selectedCycle
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Appraisal created successfully:', data);
        
        // Set the created appraisal ID and show competency selector
        setCreatedAppraisalId(data.data.id);
        setShowCompetencySelector(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appraisal');
      }
    } catch (error) {
      console.error('Error creating appraisal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create appraisal: ${errorMessage}`);
    }
  };

  const handleCompetencySave = () => {
    // Redirect to the appraisal form page
    window.location.href = `/appraisals/${createdAppraisalId}/edit`;
  };

  if (employeesLoading || cyclesLoading || templatesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Appraisal</h1>
            <p className="text-gray-600">Start a new performance appraisal process</p>
          </div>
        </div>

        <div className="p-6">
          {/* Appraisal Details Card */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Plus className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Appraisal Details</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Select the employee and appraisal parameters</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Selection */}
                <div className="space-y-2">
                  <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
                    Select Employee *
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        id="employee"
                        type="text"
                        placeholder="Search employees by name, email, or department..."
                        value={employeeSearch}
                        onChange={(e) => {
                          setEmployeeSearch(e.target.value);
                          setShowEmployeeDropdown(true);
                        }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                                {selectedEmployeeData.firstName} {selectedEmployeeData.lastName}
                              </p>
                              <p className="text-sm text-blue-700">{selectedEmployeeData.email}</p>
                              <p className="text-xs text-blue-600">{selectedEmployeeData.dept}</p>
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
                          filteredEmployees.map((employee: any) => (
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
                                    {employee.firstName} {employee.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600 truncate">{employee.email}</p>
                                  <p className="text-xs text-gray-500">{employee.dept}</p>
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
                  <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                    Appraisal Template *
                  </label>
                  <div className="relative">
                    <select
                      id="template"
                      value={selectedTemplate}
                      onChange={(e) => {
                        if (e.target.value === 'create-new') {
                          // Redirect to templates page to create new template
                          window.open('/templates', '_blank');
                          setSelectedTemplate('');
                        } else {
                          setSelectedTemplate(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                      disabled={templatesLoading}
                    >
                      <option value="">Select template...</option>
                      {templates?.map((template: any) => (
                        <option key={template.id} value={template.id}>
                          {template.displayName || template.name} ({template.type})
                        </option>
                      ))}
                      <option value="create-new" className="text-blue-600 font-medium">
                        + Create New Template
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Appraisal Cycle */}
                <div className="space-y-2">
                  <label htmlFor="cycle" className="block text-sm font-medium text-gray-700">
                    Appraisal Cycle *
                  </label>
                  <div className="relative">
                    <select
                      id="cycle"
                      value={selectedCycle}
                      onChange={(e) => {
                        if (e.target.value === 'create-new') {
                          // Redirect to cycles page to create new cycle
                          window.open('/cycles', '_blank');
                          setSelectedCycle('');
                        } else {
                          setSelectedCycle(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                      disabled={cyclesLoading}
                    >
                      <option value="">Select cycle...</option>
                      {cycles?.map((cycle: any) => {
                        const startDate = new Date(cycle.periodStart).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        });
                        const endDate = new Date(cycle.periodEnd).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        });
                        return (
                          <option key={cycle.id} value={cycle.id}>
                            {cycle.name} ({startDate} – {endDate})
                          </option>
                        );
                      })}
                      <option value="create-new" className="text-blue-600 font-medium">
                        + Create New Cycle
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Options
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={options.selfAssessment}
                        onChange={(e) => setOptions(prev => ({ ...prev, selfAssessment: e.target.checked }))}
                      />
                      <span className="text-sm text-gray-700">Include self-assessment</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={options.peerFeedback}
                        onChange={(e) => setOptions(prev => ({ ...prev, peerFeedback: e.target.checked }))}
                      />
                      <span className="text-sm text-gray-700">Include peer feedback</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={options.studentEvaluations}
                        onChange={(e) => setOptions(prev => ({ ...prev, studentEvaluations: e.target.checked }))}
                      />
                      <span className="text-sm text-gray-700">Include student evaluations</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={options.projectsEnabled}
                        onChange={(e) => setOptions(prev => ({ ...prev, projectsEnabled: e.target.checked }))}
                      />
                      <span className="text-sm text-gray-700">Enable projects section</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => window.history.back()}
                  className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAppraisal}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-5 py-2 text-sm shadow flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Appraisal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Competency Selector - Show after appraisal creation */}
          {showCompetencySelector && createdAppraisalId && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Appraisal Created Successfully!</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">Now select the competencies for this appraisal</p>
              </div>
              
              <div className="p-6">
                <CompetencySelector
                  appraisalId={createdAppraisalId}
                  onSave={handleCompetencySave}
                />
              </div>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">348</p>
                </div>
                <div className="ml-auto">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Cycles</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <div className="ml-auto">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="ml-auto">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AppraisalFormEngine } from '../components/AppraisalFormEngine';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User, Calendar, FileText, CheckCircle } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dept: string;
  title: string;
  role: string;
}

interface Cycle {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  displayName?: string;
}

export function EnhancedCreateAppraisalPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<'selection' | 'form'>('selection');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [createdAppraisalId, setCreatedAppraisalId] = useState<string | null>(null);

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      return response.json();
    },
  });

  // Fetch cycles
  const { data: cycles = [], isLoading: cyclesLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/cycles');
      if (!response.ok) throw new Error('Failed to fetch cycles');
      return response.json();
    },
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Create appraisal mutation
  const createAppraisalMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployee || !selectedCycle || !selectedTemplate) {
        throw new Error('Missing required selections');
      }

      const response = await fetch('http://10.2.1.27:3000/appraisals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          cycleId: selectedCycle.id,
          templateType: selectedTemplate.type,
          stage: 'PLANNING',
          status: 'DRAFT',
          formData: {},
          overallScore: null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create appraisal');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setCreatedAppraisalId(data.data.id);
      setStep('form');
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
    },
  });

  // Auto-select template based on employee role
  useEffect(() => {
    if (selectedEmployee && templates.length > 0) {
      const roleTemplate = templates.find((template: Template) => 
        template.type.toLowerCase().includes(selectedEmployee.role.toLowerCase()) ||
        (selectedEmployee.role === 'EMPLOYEE' && template.type === 'GENERAL_STAFF')
      );
      
      if (roleTemplate) {
        setSelectedTemplate(roleTemplate);
      }
    }
  }, [selectedEmployee, templates]);

  const handleContinue = () => {
    if (selectedEmployee && selectedCycle && selectedTemplate) {
      createAppraisalMutation.mutate();
    }
  };

  const handleSave = async (formData: any) => {
    if (createdAppraisalId) {
      await fetch(`http://10.2.1.27:3000/appraisals/${createdAppraisalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          status: 'DRAFT'
        }),
      });
    }
  };

  const handleSubmit = async (formData: any) => {
    if (createdAppraisalId) {
      await fetch(`http://10.2.1.27:3000/appraisals/${createdAppraisalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          status: 'IN_REVIEW'
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
      navigate('/dashboard');
    }
  };

  const canContinue = selectedEmployee && selectedCycle && selectedTemplate;

  if (step === 'form' && createdAppraisalId && selectedTemplate) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between sticky top-0 bg-white z-30 pb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Performance Appraisal</h1>
                <p className="mt-2 text-gray-600">Complete the performance evaluation</p>
              </div>
              <div className="flex space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  <User className="w-4 h-4 mr-1" />
                  {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {selectedCycle?.name}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <FileText className="w-4 h-4 mr-1" />
                  {selectedTemplate?.displayName || selectedTemplate?.name}
                </Badge>
              </div>
            </div>
          </div>

          {/* Appraisal Form */}
          <AppraisalFormEngine
            templateId={selectedTemplate.id}
            employeeId={selectedEmployee!.id}
            cycleId={selectedCycle!.id}
            appraisalId={createdAppraisalId}
            onSave={handleSave}
            onSubmit={handleSubmit}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="sticky top-0 bg-white z-30 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Create New Appraisal</h1>
            <p className="mt-2 text-gray-600">Select employee, cycle, and template to begin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Select Employee
              </CardTitle>
              <CardDescription>Choose the employee for appraisal</CardDescription>
            </CardHeader>
            <CardContent>
              {employeesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading employees...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {employees.map((employee: Employee) => (
                    <div
                      key={employee.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEmployee?.id === employee.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                      <div className="text-sm text-gray-600">{employee.title}</div>
                      <div className="text-sm text-gray-500">{employee.dept}</div>
                      {selectedEmployee?.id === employee.id && (
                        <CheckCircle className="w-4 h-4 text-purple-600 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cycle Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Select Cycle
              </CardTitle>
              <CardDescription>Choose the appraisal cycle</CardDescription>
            </CardHeader>
            <CardContent>
              {cyclesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading cycles...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cycles.map((cycle: Cycle) => {
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
                      <div
                        key={cycle.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCycle?.id === cycle.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCycle(cycle)}
                      >
                        <div className="font-medium">{cycle.name}</div>
                        <div className="text-sm text-gray-600">{startDate} – {endDate}</div>
                        {selectedCycle?.id === cycle.id && (
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Select Template
              </CardTitle>
              <CardDescription>Choose the appraisal template</CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading templates...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {templates.map((template: Template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="font-medium">{template.displayName || template.name}</div>
                      <div className="text-sm text-gray-600">{template.type}</div>
                      {selectedTemplate?.id === template.id && (
                        <CheckCircle className="w-4 h-4 text-purple-600 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!canContinue || createAppraisalMutation.isPending}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {createAppraisalMutation.isPending ? 'Creating...' : 'Continue to Appraisal Form'}
          </Button>
        </div>

        {/* Selection Summary */}
        {canContinue && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Ready to Create Appraisal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="font-medium">{selectedEmployee?.firstName} {selectedEmployee?.lastName}</p>
                  <p className="text-sm text-gray-600">{selectedEmployee?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cycle</p>
                  <p className="font-medium">{selectedCycle?.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedCycle?.periodStart).toLocaleDateString()} – {' '}
                    {new Date(selectedCycle?.periodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Template</p>
                  <p className="font-medium">{selectedTemplate?.displayName || selectedTemplate?.name}</p>
                  <p className="text-sm text-gray-600">{selectedTemplate?.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

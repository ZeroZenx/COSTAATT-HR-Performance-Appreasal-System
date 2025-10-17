import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AppraisalFormEngine } from '../components/AppraisalFormEngine';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User, Calendar, FileText, Loader2 } from 'lucide-react';

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

export function QuickCreateAppraisalPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [createdAppraisalId, setCreatedAppraisalId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  // Auto-select defaults when data loads
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      // Select first employee as default
      setSelectedEmployee(employees[0]);
    }
    if (cycles.length > 0 && !selectedCycle) {
      // Select the most recent active cycle
      const activeCycle = cycles.find((cycle: Cycle) => cycle.name.includes('2024')) || cycles[0];
      setSelectedCycle(activeCycle);
    }
  }, [employees, cycles, selectedEmployee, selectedCycle]);

  // Auto-select template based on employee role
  useEffect(() => {
    if (selectedEmployee && templates.length > 0 && !selectedTemplate) {
      const roleTemplate = templates.find((template: Template) => 
        template.type.toLowerCase().includes(selectedEmployee.role.toLowerCase()) ||
        (selectedEmployee.role === 'EMPLOYEE' && template.type === 'GENERAL_STAFF')
      );
      
      if (roleTemplate) {
        setSelectedTemplate(roleTemplate);
      }
    }
  }, [selectedEmployee, templates, selectedTemplate]);

  // Auto-create appraisal when all selections are ready
  useEffect(() => {
    if (selectedEmployee && selectedCycle && selectedTemplate && !createdAppraisalId && !isCreating) {
      createAppraisal();
    }
  }, [selectedEmployee, selectedCycle, selectedTemplate, createdAppraisalId, isCreating]);

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
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
    },
    onError: (error) => {
      console.error('Error creating appraisal:', error);
      setIsCreating(false);
    }
  });

  const createAppraisal = async () => {
    setIsCreating(true);
    createAppraisalMutation.mutate();
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

  // Show loading state while creating appraisal
  if (isCreating || createAppraisalMutation.isPending) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating Appraisal</h2>
              <p className="text-gray-600">Setting up your performance evaluation...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show the appraisal form once created
  if (createdAppraisalId && selectedTemplate && selectedEmployee && selectedCycle) {
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
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {selectedCycle.name}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <FileText className="w-4 h-4 mr-1" />
                  {selectedTemplate.displayName || selectedTemplate.name}
                </Badge>
              </div>
            </div>
          </div>

          {/* Appraisal Form */}
          <AppraisalFormEngine
            templateId={selectedTemplate.id}
            employeeId={selectedEmployee.id}
            cycleId={selectedCycle.id}
            appraisalId={createdAppraisalId}
            onSave={handleSave}
            onSubmit={handleSubmit}
          />
        </div>
      </Layout>
    );
  }

  // Show selection interface if needed (fallback)
  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="sticky top-0 bg-white z-30 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Create New Appraisal</h1>
            <p className="mt-2 text-gray-600">Setting up your performance evaluation...</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appraisal Setup</CardTitle>
            <CardDescription>Automatically configuring your appraisal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeesLoading && <p>Loading employees...</p>}
              {cyclesLoading && <p>Loading cycles...</p>}
              {templatesLoading && <p>Loading templates...</p>}
              
              {selectedEmployee && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Selected: {selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                </div>
              )}
              
              {selectedCycle && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Cycle: {selectedCycle.name}</span>
                </div>
              )}
              
              {selectedTemplate && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Template: {selectedTemplate.displayName || selectedTemplate.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

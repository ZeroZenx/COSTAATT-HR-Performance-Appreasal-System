import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, User, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  division: string;
  employmentType: string;
  employmentCategory: string;
  category?: {
    id: string;
    name: string;
    description?: string;
    filePath?: string;
  };
}

interface AppraisalTemplate {
  id: string;
  name: string;
  type: string;
  displayName: string;
  filePath?: string;
  category?: {
    id: string;
    name: string;
  };
  configJson?: any;
  description?: string;
}

interface AppraisalCycle {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: string;
}

interface Competency {
  id: string;
  code: string;
  title: string;
  cluster: string;
  department: string;
  definition: string;
  behaviorsBasic: string;
  behaviorsAbove: string;
  behaviorsOutstanding: string;
}

export default function AppraisalDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AppraisalTemplate | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<AppraisalCycle | null>(null);
  
  
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      return response.json();
    },
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Fetch cycles
  const { data: cycles = [], isLoading: cyclesLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/cycles');
      if (!response.ok) throw new Error('Failed to fetch cycles');
      return response.json();
    },
  });

  // Fetch competencies
  const { data: competencies = [], isLoading: competenciesLoading } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/competencies');
      if (!response.ok) throw new Error('Failed to fetch competencies');
      return response.json();
    },
  });

  // Filter employees based on search
  const filteredEmployees = employees.filter((emp: Employee) => {
    const searchTerm = employeeSearch.toLowerCase();
    const fullName = `${emp.user.firstName} ${emp.user.lastName}`.toLowerCase();
    const email = emp.user.email.toLowerCase();
    const division = emp.division.toLowerCase();
    
    return fullName.includes(searchTerm) || 
           email.includes(searchTerm) || 
           division.includes(searchTerm);
  });

  // Clear template selection when employee changes (manual selection)
  useEffect(() => {
    if (selectedEmployee) {
      setSelectedTemplate(null);
    }
  }, [selectedEmployee]);

  // Create appraisal mutation
  const createAppraisalMutation = useMutation({
    mutationFn: async (appraisalData: any) => {
      const response = await fetch('http://localhost:3000/appraisals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appraisalData),
      });
      if (!response.ok) throw new Error('Failed to create appraisal');
      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Appraisal created successfully!');
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
      navigate(`/appraisals/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error('Failed to create appraisal');
      console.error('Error creating appraisal:', error);
    },
  });

  const handleCreateAppraisal = () => {
    if (!selectedEmployee || !selectedTemplate || !selectedCycle) {
      toast.error('Please select an employee, template, and cycle');
      return;
    }

    setIsCreating(true);
    createAppraisalMutation.mutate({
      employeeId: selectedEmployee.id,
      templateId: selectedTemplate.id,
      cycleId: selectedCycle.id,
      options: {},
      sections: {},
    });
  };

  const isFormValid = selectedEmployee && selectedTemplate && selectedCycle;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Appraisal</h1>
          <p className="text-muted-foreground">
            Select employee and appraisal parameters to create a new performance review
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/appraisals')}
        >
          Back to Appraisals
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Employee *
            </CardTitle>
            <CardDescription>
              Search employees by name, email, or department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {selectedEmployee && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Selected Employee</span>
                </div>
                <div className="mt-2">
                  <p className="font-semibold">
                    {selectedEmployee.user.firstName} {selectedEmployee.user.lastName}
                  </p>
                  <p className="text-sm text-green-700">{selectedEmployee.user.email}</p>
                  <p className="text-sm text-green-700 font-medium">{selectedEmployee.user.title}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{selectedEmployee.division}</Badge>
                    <Badge variant="outline">{selectedEmployee.employmentType}</Badge>
                    <Badge variant="outline">{selectedEmployee.employmentCategory}</Badge>
                    {selectedEmployee.category && (
                      <Badge variant="default">{selectedEmployee.category.name}</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2">
              {employeesLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading employees...
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No employees found
                </div>
              ) : (
                filteredEmployees.map((employee: Employee) => (
                  <div
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                      selectedEmployee?.id === employee.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {employee.user.firstName} {employee.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{employee.user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {employee.division}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {employee.employmentType}
                          </Badge>
                        </div>
                      </div>
                      {selectedEmployee?.id === employee.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Template and Cycle Selection */}
        <div className="space-y-6">
          {/* Appraisal Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Appraisal Template *
              </CardTitle>
              <CardDescription>
                Choose the appropriate template based on the employee's role and position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedTemplate?.id || ''}
                onValueChange={(value) => {
                  const template = templates.find((t: AppraisalTemplate) => t.id === value);
                  setSelectedTemplate(template || null);
                }}
                disabled={templatesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: AppraisalTemplate) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <p className="font-medium">{template.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.type} • {template.configJson?.sections?.length || 0} sections
                        </p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTemplate && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Selected Template</span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedTemplate.displayName}</p>
                    <p className="text-sm text-blue-700">{selectedTemplate.name}</p>
                    {selectedTemplate.filePath && (
                      <p className="text-xs text-blue-600 mt-1">
                        📄 {selectedTemplate.filePath}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {selectedTemplate.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedTemplate.configJson?.sections?.length || 0} sections
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appraisal Cycle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appraisal Cycle *
              </CardTitle>
              <CardDescription>
                Choose the performance review cycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCycle?.id || ''}
                onValueChange={(value) => {
                  const cycle = cycles.find((c: AppraisalCycle) => c.id === value);
                  setSelectedCycle(cycle || null);
                }}
                disabled={cyclesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle..." />
                </SelectTrigger>
                <SelectContent>
                  {cycles.map((cycle: AppraisalCycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      <div>
                        <p className="font-medium">{cycle.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(cycle.periodStart).toLocaleDateString()} - {new Date(cycle.periodEnd).toLocaleDateString()}
                        </p>
                        <Badge 
                          variant={cycle.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className="text-xs mt-1"
                        >
                          {cycle.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* COSTAATT Competency Framework */}
      <Card>
        <CardHeader>
          <CardTitle>COSTAATT Competency Framework</CardTitle>
          <CardDescription>
            Comprehensive performance standards for academic excellence in all areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {competenciesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading competencies...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                {competencies.length} competencies found
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competencies.map((competency: Competency) => (
                  <div key={competency.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{competency.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {competency.cluster}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {competency.definition}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <p><strong>Department:</strong> {competency.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/appraisals')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateAppraisal}
          disabled={!isFormValid || isCreating || createAppraisalMutation.isPending}
          className="min-w-[120px]"
        >
          {isCreating || createAppraisalMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Creating...
            </>
          ) : (
            'Create Appraisal'
          )}
        </Button>
      </div>

      {/* Form Validation Status */}
      {!isFormValid && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            Please select an employee, template, and cycle to create the appraisal
          </span>
        </div>
      )}
    </div>
  );
}

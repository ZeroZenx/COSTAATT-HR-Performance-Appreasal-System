import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AppraisalFormRouter } from '../components/AppraisalFormRouter';
import { FileText, Users, Calendar, Target } from 'lucide-react';

export function AppraisalFormsPage() {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'GENERAL_STAFF' | 'FACULTY' | 'DEAN' | 'CLINICAL_INSTRUCTOR' | 'EXECUTIVE_MANAGEMENT'>('GENERAL_STAFF');
  const [showForm, setShowForm] = useState(false);

  // Fetch employees
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/employees');
      return response.json();
    }
  });

  // Fetch cycles
  const { data: cycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/cycles');
      return response.json();
    }
  });

  const handleStartAppraisal = () => {
    if (selectedEmployee && selectedCycle && selectedTemplate) {
      setShowForm(true);
    }
  };

  const handleSaveAppraisal = (data: any) => {
    console.log('Appraisal saved:', data);
    // Handle appraisal save logic here
  };

  if (showForm && selectedEmployee && selectedCycle) {
    return (
      <AppraisalFormRouter
        employeeId={selectedEmployee}
        cycleId={selectedCycle}
        templateType={selectedTemplate}
        onSave={handleSaveAppraisal}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Appraisal Forms</h1>
          <p className="text-gray-600">Select an employee, cycle, and template to begin the appraisal process</p>
        </div>

        {/* Template Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedTemplate === 'GENERAL_STAFF' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTemplate('GENERAL_STAFF')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>General Staff</span>
              </CardTitle>
              <CardDescription>
                Standard performance appraisal for general staff positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>• Job Performance (60%)</div>
                <div>• Core Competencies (30%)</div>
                <div>• Goals & Objectives (10%)</div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedTemplate === 'FACULTY' 
                ? 'ring-2 ring-green-500 bg-green-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTemplate('FACULTY')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>Faculty</span>
              </CardTitle>
              <CardDescription>
                Comprehensive appraisal for academic faculty members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>• Teaching Excellence (40%)</div>
                <div>• Research & Scholarship (30%)</div>
                <div>• Service & Leadership (20%)</div>
                <div>• Professional Development (10%)</div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedTemplate === 'DEAN' 
                ? 'ring-2 ring-purple-500 bg-purple-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTemplate('DEAN')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Dean</span>
              </CardTitle>
              <CardDescription>
                Leadership-focused appraisal for academic deans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>• Academic Leadership (35%)</div>
                <div>• Administrative Excellence (30%)</div>
                <div>• External Relations (20%)</div>
                <div>• Research & Scholarship (15%)</div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedTemplate === 'CLINICAL_INSTRUCTOR' 
                ? 'ring-2 ring-orange-500 bg-orange-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTemplate('CLINICAL_INSTRUCTOR')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <span>Clinical Instructor</span>
              </CardTitle>
              <CardDescription>
                Specialized appraisal for clinical instructors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>• Clinical Teaching (40%)</div>
                <div>• Professional Practice (30%)</div>
                <div>• Educational Leadership (20%)</div>
                <div>• Research & Scholarship (10%)</div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedTemplate === 'EXECUTIVE_MANAGEMENT' 
                ? 'ring-2 ring-red-500 bg-red-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTemplate('EXECUTIVE_MANAGEMENT')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-600" />
                <span>Executive Management</span>
              </CardTitle>
              <CardDescription>
                Strategic leadership appraisal for executive positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>• Strategic Leadership (35%)</div>
                <div>• Operational Excellence (30%)</div>
                <div>• Stakeholder Relations (20%)</div>
                <div>• Financial Management (15%)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Start New Appraisal</CardTitle>
            <CardDescription>
              Select the employee, appraisal cycle, and template to begin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee
                </label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesLoading ? (
                      <SelectItem value="loading" disabled>Loading employees...</SelectItem>
                    ) : (
                      employees?.map((employee: any) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} - {employee.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Appraisal Cycle
                </label>
                <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a cycle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cyclesLoading ? (
                      <SelectItem value="loading" disabled>Loading cycles...</SelectItem>
                    ) : (
                      cycles?.map((cycle: any) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline" className="text-sm">
                    {selectedTemplate.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleStartAppraisal}
                disabled={!selectedEmployee || !selectedCycle}
                className="px-6"
              >
                Start Appraisal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Template Information */}
        <Card>
          <CardHeader>
            <CardTitle>Appraisal Process Overview</CardTitle>
            <CardDescription>
              Each appraisal follows a structured three-stage process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Planning Phase</h3>
                <p className="text-sm text-gray-600">
                  Goal setting, expectation alignment, and development planning
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Mid-Year Review</h3>
                <p className="text-sm text-gray-600">
                  Progress check-in, feedback, and goal adjustments
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Final Appraisal</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive evaluation and performance assessment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

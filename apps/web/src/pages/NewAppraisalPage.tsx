import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AppraisalTemplateSelector } from '../components/AppraisalTemplateSelector';
import { useQuery } from '@tanstack/react-query';

export function NewAppraisalPage() {
  const navigate = useNavigate();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    cycleId: '',
    templateId: '',
    isOptional: false,
    isPeerReview: false,
    isStudentEvaluation: false,
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/employees');
      return response.json();
    }
  });

  const { data: cycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/cycles');
      return response.json();
    }
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/templates');
      return response.json();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.employeeId && formData.cycleId) {
      setShowTemplateSelector(true);
    }
  };

  const handleAppraisalSave = (data: any) => {
    console.log('Appraisal saved:', data);
    // Handle saving the complete appraisal
    navigate('/appraisals');
  };

  const handleCancel = () => {
    setShowTemplateSelector(false);
  };

  if (showTemplateSelector) {
    const selectedEmployee = employees?.find((emp: any) => emp.id === formData.employeeId);
    return (
      <AppraisalTemplateSelector
        employeeId={formData.employeeId}
        cycleId={formData.cycleId}
        employeeCategory={selectedEmployee?.employmentCategory || 'GENERAL_STAFF'}
        onSave={handleAppraisalSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Appraisal</h1>
              <p className="mt-2 text-gray-600">Start a new performance appraisal for an employee</p>
            </div>
            <button
              onClick={() => navigate('/appraisals')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Appraisals
            </button>
          </div>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Choose an employee...</option>
                {employeesLoading ? (
                  <option disabled>Loading employees...</option>
                ) : employees?.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user.firstName} {employee.user.lastName} - {employee.user.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Appraisal Cycle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appraisal Cycle *
              </label>
              <select
                value={formData.cycleId}
                onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select appraisal cycle...</option>
                {cyclesLoading ? (
                  <option disabled>Loading cycles...</option>
                ) : cycles?.map((cycle: any) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name} ({cycle.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appraisal Template *
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Choose a template...</option>
                {templatesLoading ? (
                  <option disabled>Loading templates...</option>
                ) : templates?.map((template: any) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Flags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Optional Features</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isOptional}
                    onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Make this appraisal optional</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPeerReview}
                    onChange={(e) => setFormData({ ...formData, isPeerReview: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable peer review</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isStudentEvaluation}
                    onChange={(e) => setFormData({ ...formData, isStudentEvaluation: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include student evaluations</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/appraisals')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Appraisal
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

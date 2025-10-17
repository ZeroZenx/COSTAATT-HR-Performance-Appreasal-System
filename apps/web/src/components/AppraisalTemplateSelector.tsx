import React, { useState } from 'react';
import { DeanAppraisalForm } from './appraisal-templates/DeanAppraisalForm';
import { ClinicalInstructorAppraisalForm } from './appraisal-templates/ClinicalInstructorAppraisalForm';
import { FacultyAppraisalForm } from './appraisal-templates/FacultyAppraisalForm';
import { ExecutiveManagementAppraisalForm } from './appraisal-templates/ExecutiveManagementAppraisalForm';
import { GeneralStaffAppraisalForm } from './appraisal-templates/GeneralStaffAppraisalForm';
import { GoalSettingWorksheet } from './GoalSettingWorksheet';

interface AppraisalTemplateSelectorProps {
  employeeId: string;
  cycleId: string;
  employeeCategory: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function AppraisalTemplateSelector({ 
  employeeId, 
  cycleId, 
  employeeCategory, 
  onSave, 
  onCancel 
}: AppraisalTemplateSelectorProps) {
  const [currentStep, setCurrentStep] = useState<'template' | 'goals' | 'appraisal'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [appraisalData, setAppraisalData] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);

  const templates = [
    {
      id: 'dean',
      name: 'Dean Performance Appraisal',
      description: 'Comprehensive appraisal for Deans with weighted scoring across functional competencies, core competencies, and goals.',
      category: 'DEAN',
      sections: [
        'Functional Competencies (50%) - Policy, Academic Leadership, Administration, Research, Networking',
        'Core Competencies (30%) - 10 competency areas',
        'Goals/Projects (20%) - 3 goals rated 0-4'
      ],
      scoring: 'Auto-calculates weighted score with final rating classification'
    },
    {
      id: 'clinical',
      name: 'Clinical Instructor Appraisal',
      description: 'Specialized appraisal for Clinical Instructors with focus on clinical teaching and student evaluations.',
      category: 'CLINICAL_INSTRUCTOR',
      sections: [
        'Functional Competencies (60%) - Clinical Teaching, Patient Care, Supervision',
        'Core Competencies (20%) - 9 competency areas',
        'Student Evaluations (20%) - Up to 6 courses rated 1-5'
      ],
      scoring: 'Weighted scoring with final rating classification'
    },
    {
      id: 'faculty',
      name: 'Faculty Performance Appraisal',
      description: 'Comprehensive faculty appraisal with auto-scaling based on project evaluation inclusion.',
      category: 'FACULTY',
      sections: [
        'Functional Competencies (60%) - Teaching, Curriculum, Research, Service',
        'Core Competencies (30%) - 10 competency areas',
        'Student Evaluations (20% or 15%) - Up to 10 courses',
        'Project Evaluation (0% or 5%) - Optional project assessment'
      ],
      scoring: 'Auto-scaling weights based on project evaluation inclusion'
    },
    {
      id: 'executive',
      name: 'Executive Management Appraisal',
      description: 'Leadership-focused appraisal for executive management positions.',
      category: 'EXECUTIVE_MANAGEMENT',
      sections: [
        'Strategic Leadership (50%) - Vision, Strategy, Decision Making',
        'Core Competencies (30%) - Leadership, Communication, Innovation',
        'Goals/Projects (20%) - Strategic objectives and outcomes'
      ],
      scoring: 'Weighted scoring with leadership focus'
    },
    {
      id: 'staff',
      name: 'General Staff Appraisal',
      description: 'Standard appraisal template for general staff positions.',
      category: 'GENERAL_STAFF',
      sections: [
        'Job Performance (60%) - Core job functions and responsibilities',
        'Core Competencies (30%) - Professional skills and behaviors',
        'Goals/Projects (10%) - Performance objectives'
      ],
      scoring: 'Standard weighted scoring (1-3 scale)'
    }
  ];

  const getTemplateForCategory = (category: string) => {
    return templates.find(t => t.category === category) || templates[0];
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentStep('goals');
  };

  const handleGoalsSave = (savedGoals: any[]) => {
    setGoals(savedGoals);
    setCurrentStep('appraisal');
  };

  const handleAppraisalSave = (data: any) => {
    setAppraisalData(data);
    onSave({
      template: selectedTemplate,
      goals: goals,
      appraisal: data
    });
  };

  const renderTemplateSelection = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Appraisal Template</h2>
        <p className="text-gray-600">Choose the appropriate appraisal template for this employee category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.category.replace('_', ' ')}</p>
              </div>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {template.category}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Sections:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {template.sections.map((section, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    {section}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Scoring:</h4>
              <p className="text-sm text-gray-600">{template.scoring}</p>
            </div>
            
            <button
              onClick={() => handleTemplateSelect(template.id)}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Select Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoalsStep = () => (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goal Setting Worksheet</h2>
          <p className="text-gray-600">Define performance goals before starting the appraisal</p>
        </div>
        <button
          onClick={() => setCurrentStep('template')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Templates
        </button>
      </div>
      <GoalSettingWorksheet
        employeeId={employeeId}
        supervisorId=""
        cycleId={cycleId}
        onSave={handleGoalsSave}
      />
    </div>
  );

  const renderAppraisalStep = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template?.name}</h2>
            <p className="text-gray-600">Complete the performance appraisal</p>
          </div>
          <button
            onClick={() => setCurrentStep('goals')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Goals
          </button>
        </div>
        
        {selectedTemplate === 'dean' && (
          <DeanAppraisalForm
            employeeId={employeeId}
            cycleId={cycleId}
            onSave={handleAppraisalSave}
          />
        )}
        
        {selectedTemplate === 'clinical' && (
          <ClinicalInstructorAppraisalForm
            employeeId={employeeId}
            cycleId={cycleId}
            onSave={handleAppraisalSave}
          />
        )}
        
        {selectedTemplate === 'faculty' && (
          <FacultyAppraisalForm
            employeeId={employeeId}
            cycleId={cycleId}
            onSave={handleAppraisalSave}
          />
        )}
        
        {selectedTemplate === 'executive' && (
          <ExecutiveManagementAppraisalForm
            employeeId={employeeId}
            cycleId={cycleId}
            onSave={handleAppraisalSave}
          />
        )}
        
        {selectedTemplate === 'staff' && (
          <GeneralStaffAppraisalForm
            employeeId={employeeId}
            cycleId={cycleId}
            onSave={handleAppraisalSave}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${currentStep === 'template' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'template' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-2 font-medium">Select Template</span>
              </div>
              <div className={`flex items-center ${currentStep === 'goals' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'goals' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">Set Goals</span>
              </div>
              <div className={`flex items-center ${currentStep === 'appraisal' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'appraisal' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium">Complete Appraisal</span>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {currentStep === 'template' && renderTemplateSelection()}
        {currentStep === 'goals' && renderGoalsStep()}
        {currentStep === 'appraisal' && renderAppraisalStep()}
      </div>
    </div>
  );
}

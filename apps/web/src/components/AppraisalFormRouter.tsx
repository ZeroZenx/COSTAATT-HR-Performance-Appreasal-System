import React from 'react';
import { GeneralStaffAppraisalForm } from './appraisal-forms/GeneralStaffAppraisalForm';
import { FacultyAppraisalForm } from './appraisal-forms/FacultyAppraisalForm';
import { DeanAppraisalForm } from './appraisal-forms/DeanAppraisalForm';
import { ClinicalInstructorAppraisalForm } from './appraisal-forms/ClinicalInstructorAppraisalForm';
import { ExecutiveManagementAppraisalForm } from './appraisal-forms/ExecutiveManagementAppraisalForm';
import { AppraisalCycleManager } from './AppraisalCycleManager';

interface AppraisalFormRouterProps {
  employeeId: string;
  cycleId: string;
  templateType: 'GENERAL_STAFF' | 'FACULTY' | 'DEAN' | 'CLINICAL_INSTRUCTOR' | 'EXECUTIVE_MANAGEMENT';
  stage?: 'PLANNING' | 'MID_YEAR' | 'FINAL';
  onSave: (data: any) => void;
}

export function AppraisalFormRouter({ 
  employeeId, 
  cycleId, 
  templateType, 
  stage = 'PLANNING',
  onSave 
}: AppraisalFormRouterProps) {
  
  // Common props for all forms
  const commonProps = {
    employeeId,
    cycleId,
    onSave
  };

  // Render the appropriate form based on template type
  const renderForm = () => {
    switch (templateType) {
      case 'GENERAL_STAFF':
        return <GeneralStaffAppraisalForm {...commonProps} />;
      case 'FACULTY':
        return <FacultyAppraisalForm {...commonProps} />;
      case 'DEAN':
        return <DeanAppraisalForm {...commonProps} />;
      case 'CLINICAL_INSTRUCTOR':
        return <ClinicalInstructorAppraisalForm {...commonProps} />;
      case 'EXECUTIVE_MANAGEMENT':
        return <ExecutiveManagementAppraisalForm {...commonProps} />;
      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h2>
              <p className="text-gray-600">
                The selected template type "{templateType}" is not supported.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cycle Manager */}
      <AppraisalCycleManager 
        employeeId={employeeId}
        cycleId={cycleId}
        templateType={templateType}
      />
      
      {/* Form Content */}
      <div className="mt-6">
        {renderForm()}
      </div>
    </div>
  );
}

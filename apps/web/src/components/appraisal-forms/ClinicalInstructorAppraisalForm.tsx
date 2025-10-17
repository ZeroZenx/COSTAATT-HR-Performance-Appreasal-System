import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Save, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ClinicalInstructorAppraisalFormProps {
  employeeId: string;
  cycleId: string;
  onSave: (data: any) => void;
}

interface ClinicalInstructorAppraisalData {
  id?: string;
  employeeId: string;
  cycleId: string;
  templateType: 'CLINICAL_INSTRUCTOR';
  stage: 'PLANNING' | 'MID_YEAR' | 'FINAL';
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'COMPLETED';
  
  // Employee Information
  employeeName: string;
  position: string;
  department: string;
  supervisorName: string;
  appraisalPeriod: string;
  
  // Section 1: Clinical Teaching Excellence (40%)
  clinicalTeachingExcellence: {
    clinicalSupervision: { score: number; comments: string };
    studentMentoring: { score: number; comments: string };
    clinicalAssessment: { score: number; comments: string };
    practicalSkills: { score: number; comments: string };
    clinicalInnovation: { score: number; comments: string };
  };
  
  // Section 2: Professional Practice (30%)
  professionalPractice: {
    clinicalCompetence: { score: number; comments: string };
    evidenceBasedPractice: { score: number; comments: string };
    patientSafety: { score: number; comments: string };
    qualityImprovement: { score: number; comments: string };
    professionalStandards: { score: number; comments: string };
  };
  
  // Section 3: Educational Leadership (20%)
  educationalLeadership: {
    curriculumDevelopment: { score: number; comments: string };
    programCoordination: { score: number; comments: string };
    facultyDevelopment: { score: number; comments: string };
    clinicalPlacement: { score: number; comments: string };
    educationalInnovation: { score: number; comments: string };
  };
  
  // Section 4: Research and Scholarship (10%)
  researchAndScholarship: {
    clinicalResearch: { score: number; comments: string };
    publication: { score: number; comments: string };
    conferencePresentation: { score: number; comments: string };
    knowledgeTranslation: { score: number; comments: string };
    professionalDevelopment: { score: number; comments: string };
  };
  
  // Overall Assessment
  overallAssessment: {
    strengths: string;
    areasForImprovement: string;
    developmentRecommendations: string;
    overallRating: number;
    supervisorComments: string;
  };
  
  // Signatures
  signatures: {
    employeeSignature: string;
    employeeDate: string;
    supervisorSignature: string;
    supervisorDate: string;
    divisionalHeadSignature: string;
    divisionalHeadDate: string;
  };
  
  // Metadata
  version: string;
  createdAt: string;
  updatedAt: string;
}

export function ClinicalInstructorAppraisalForm({ employeeId, cycleId, onSave }: ClinicalInstructorAppraisalFormProps) {
  const [formData, setFormData] = useState<ClinicalInstructorAppraisalData>({
    employeeId,
    cycleId,
    templateType: 'CLINICAL_INSTRUCTOR',
    stage: 'PLANNING',
    status: 'DRAFT',
    employeeName: '',
    position: '',
    department: '',
    supervisorName: '',
    appraisalPeriod: '',
    clinicalTeachingExcellence: {
      clinicalSupervision: { score: 0, comments: '' },
      studentMentoring: { score: 0, comments: '' },
      clinicalAssessment: { score: 0, comments: '' },
      practicalSkills: { score: 0, comments: '' },
      clinicalInnovation: { score: 0, comments: '' }
    },
    professionalPractice: {
      clinicalCompetence: { score: 0, comments: '' },
      evidenceBasedPractice: { score: 0, comments: '' },
      patientSafety: { score: 0, comments: '' },
      qualityImprovement: { score: 0, comments: '' },
      professionalStandards: { score: 0, comments: '' }
    },
    educationalLeadership: {
      curriculumDevelopment: { score: 0, comments: '' },
      programCoordination: { score: 0, comments: '' },
      facultyDevelopment: { score: 0, comments: '' },
      clinicalPlacement: { score: 0, comments: '' },
      educationalInnovation: { score: 0, comments: '' }
    },
    researchAndScholarship: {
      clinicalResearch: { score: 0, comments: '' },
      publication: { score: 0, comments: '' },
      conferencePresentation: { score: 0, comments: '' },
      knowledgeTranslation: { score: 0, comments: '' },
      professionalDevelopment: { score: 0, comments: '' }
    },
    overallAssessment: {
      strengths: '',
      areasForImprovement: '',
      developmentRecommendations: '',
      overallRating: 0,
      supervisorComments: ''
    },
    signatures: {
      employeeSignature: '',
      employeeDate: '',
      supervisorSignature: '',
      supervisorDate: '',
      divisionalHeadSignature: '',
      divisionalHeadDate: ''
    },
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [currentSection, setCurrentSection] = useState('clinicalTeachingExcellence');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch employee data
  const { data: employee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const response = await fetch(`http://10.2.1.27:3000/employees/${employeeId}`);
      return response.json();
    }
  });

  // Fetch appraisal cycle data
  const { data: cycle } = useQuery({
    queryKey: ['cycle', cycleId],
    queryFn: async () => {
      const response = await fetch(`http://10.2.1.27:3000/cycles/${cycleId}`);
      return response.json();
    }
  });

  // Auto-populate employee data
  useEffect(() => {
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        position: employee.title || '',
        department: employee.dept || '',
        supervisorName: employee.supervisorName || '',
        appraisalPeriod: cycle?.name || ''
      }));
    }
  }, [employee, cycle]);

  // Calculate section scores
  const calculateSectionScore = (section: any) => {
    const scores = Object.values(section).filter(item => typeof item === 'object' && 'score' in item);
    const totalScore = scores.reduce((sum: number, item: any) => sum + (item.score || 0), 0);
    return scores.length > 0 ? totalScore / scores.length : 0;
  };

  // Calculate overall score
  const calculateOverallScore = () => {
    const teachingScore = calculateSectionScore(formData.clinicalTeachingExcellence) * 0.4;
    const practiceScore = calculateSectionScore(formData.professionalPractice) * 0.3;
    const leadershipScore = calculateSectionScore(formData.educationalLeadership) * 0.2;
    const researchScore = calculateSectionScore(formData.researchAndScholarship) * 0.1;
    return teachingScore + practiceScore + leadershipScore + researchScore;
  };

  const handleScoreChange = (section: string, field: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ClinicalInstructorAppraisalData],
        [field]: {
          ...(prev[section as keyof ClinicalInstructorAppraisalData] as any)[field],
          score
        }
      }
    }));
  };

  const handleCommentsChange = (section: string, field: string, comments: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ClinicalInstructorAppraisalData],
        [field]: {
          ...(prev[section as keyof ClinicalInstructorAppraisalData] as any)[field],
          comments
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://10.2.1.27:3000/appraisals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          overallScore: calculateOverallScore(),
          updatedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        onSave(formData);
      }
    } catch (error) {
      console.error('Error saving appraisal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderScoreInput = (section: string, field: string, score: number) => (
    <div className="flex items-center space-x-2">
      <Select value={score.toString()} onValueChange={(value) => handleScoreChange(section, field, parseInt(value))}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 - Unsatisfactory</SelectItem>
          <SelectItem value="2">2 - Below Expectations</SelectItem>
          <SelectItem value="3">3 - Meets Expectations</SelectItem>
          <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
          <SelectItem value="5">5 - Outstanding</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-sm text-gray-500">({score}/5)</span>
    </div>
  );

  const renderSection = (title: string, section: string, fields: any[], weight: number) => (
    <Card key={section} className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          <Badge variant="outline">{weight}% Weight</Badge>
        </CardTitle>
        <CardDescription>
          Score: {calculateSectionScore(formData[section as keyof ClinicalInstructorAppraisalData]).toFixed(1)}/5.0
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.key} className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <p className="text-sm text-gray-500 mb-3">{field.description}</p>
              </div>
              <div className="ml-4">
                {renderScoreInput(section, field.key, (formData[section as keyof ClinicalInstructorAppraisalData] as any)[field.key]?.score || 0)}
              </div>
            </div>
            <Textarea
              placeholder={`Comments for ${field.label.toLowerCase()}...`}
              value={(formData[section as keyof ClinicalInstructorAppraisalData] as any)[field.key]?.comments || ''}
              onChange={(e) => handleCommentsChange(section, field.key, e.target.value)}
              rows={3}
              className="w-full"
            />
            {index < fields.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Clinical Instructor Performance Appraisal</CardTitle>
          <CardDescription>
            Employee: {formData.employeeName} | Position: {formData.position} | Department: {formData.department}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium">Supervisor:</label>
              <p>{formData.supervisorName}</p>
            </div>
            <div>
              <label className="font-medium">Appraisal Period:</label>
              <p>{formData.appraisalPeriod}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex space-x-2">
        {[
          { key: 'clinicalTeachingExcellence', label: 'Clinical Teaching (40%)' },
          { key: 'professionalPractice', label: 'Professional Practice (30%)' },
          { key: 'educationalLeadership', label: 'Educational Leadership (20%)' },
          { key: 'researchAndScholarship', label: 'Research & Scholarship (10%)' },
          { key: 'overallAssessment', label: 'Overall Assessment' }
        ].map((section) => (
          <Button
            key={section.key}
            variant={currentSection === section.key ? 'default' : 'outline'}
            onClick={() => setCurrentSection(section.key)}
            className="text-sm"
          >
            {section.label}
          </Button>
        ))}
      </div>

      {/* Clinical Teaching Excellence Section */}
      {currentSection === 'clinicalTeachingExcellence' && renderSection(
        'Clinical Teaching Excellence',
        'clinicalTeachingExcellence',
        [
          {
            key: 'clinicalSupervision',
            label: 'Clinical Supervision',
            description: 'Quality of clinical supervision and guidance provided to students'
          },
          {
            key: 'studentMentoring',
            label: 'Student Mentoring',
            description: 'Effectiveness in mentoring and supporting student development'
          },
          {
            key: 'clinicalAssessment',
            label: 'Clinical Assessment',
            description: 'Fairness and effectiveness of clinical evaluation methods'
          },
          {
            key: 'practicalSkills',
            label: 'Practical Skills Development',
            description: 'Ability to develop students\' practical clinical skills'
          },
          {
            key: 'clinicalInnovation',
            label: 'Clinical Innovation',
            description: 'Innovation in clinical teaching methods and approaches'
          }
        ],
        40
      )}

      {/* Professional Practice Section */}
      {currentSection === 'professionalPractice' && renderSection(
        'Professional Practice',
        'professionalPractice',
        [
          {
            key: 'clinicalCompetence',
            label: 'Clinical Competence',
            description: 'Demonstration of high-level clinical skills and expertise'
          },
          {
            key: 'evidenceBasedPractice',
            label: 'Evidence-Based Practice',
            description: 'Integration of evidence-based practice in clinical teaching'
          },
          {
            key: 'patientSafety',
            label: 'Patient Safety',
            description: 'Commitment to patient safety and quality care standards'
          },
          {
            key: 'qualityImprovement',
            label: 'Quality Improvement',
            description: 'Participation in quality improvement initiatives'
          },
          {
            key: 'professionalStandards',
            label: 'Professional Standards',
            description: 'Adherence to professional standards and ethical guidelines'
          }
        ],
        30
      )}

      {/* Educational Leadership Section */}
      {currentSection === 'educationalLeadership' && renderSection(
        'Educational Leadership',
        'educationalLeadership',
        [
          {
            key: 'curriculumDevelopment',
            label: 'Curriculum Development',
            description: 'Contribution to clinical curriculum development and improvement'
          },
          {
            key: 'programCoordination',
            label: 'Program Coordination',
            description: 'Effectiveness in coordinating clinical education programs'
          },
          {
            key: 'facultyDevelopment',
            label: 'Faculty Development',
            description: 'Support and development of clinical faculty members'
          },
          {
            key: 'clinicalPlacement',
            label: 'Clinical Placement',
            description: 'Management of clinical placement and partnerships'
          },
          {
            key: 'educationalInnovation',
            label: 'Educational Innovation',
            description: 'Innovation in clinical education delivery and methods'
          }
        ],
        20
      )}

      {/* Research and Scholarship Section */}
      {currentSection === 'researchAndScholarship' && renderSection(
        'Research and Scholarship',
        'researchAndScholarship',
        [
          {
            key: 'clinicalResearch',
            label: 'Clinical Research',
            description: 'Participation in clinical research and evidence generation'
          },
          {
            key: 'publication',
            label: 'Publication',
            description: 'Publication of clinical and educational research findings'
          },
          {
            key: 'conferencePresentation',
            label: 'Conference Presentation',
            description: 'Presentation of clinical education research at conferences'
          },
          {
            key: 'knowledgeTranslation',
            label: 'Knowledge Translation',
            description: 'Translation of research findings into clinical practice'
          },
          {
            key: 'professionalDevelopment',
            label: 'Professional Development',
            description: 'Commitment to ongoing professional development and learning'
          }
        ],
        10
      )}

      {/* Overall Assessment Section */}
      {currentSection === 'overallAssessment' && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strengths
              </label>
              <Textarea
                placeholder="Identify key strengths and positive contributions..."
                value={formData.overallAssessment.strengths}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  overallAssessment: { ...prev.overallAssessment, strengths: e.target.value }
                }))}
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas for Improvement
              </label>
              <Textarea
                placeholder="Identify areas where improvement is needed..."
                value={formData.overallAssessment.areasForImprovement}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  overallAssessment: { ...prev.overallAssessment, areasForImprovement: e.target.value }
                }))}
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Development Recommendations
              </label>
              <Textarea
                placeholder="Recommendations for professional development..."
                value={formData.overallAssessment.developmentRecommendations}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  overallAssessment: { ...prev.overallAssessment, developmentRecommendations: e.target.value }
                }))}
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Overall Rating:
              </label>
              <Select 
                value={formData.overallAssessment.overallRating.toString()} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  overallAssessment: { ...prev.overallAssessment, overallRating: parseInt(value) }
                }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                  <SelectItem value="2">2 - Below Expectations</SelectItem>
                  <SelectItem value="3">3 - Meets Expectations</SelectItem>
                  <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                  <SelectItem value="5">5 - Outstanding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supervisor Comments
              </label>
              <Textarea
                placeholder="Additional supervisor comments..."
                value={formData.overallAssessment.supervisorComments}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  overallAssessment: { ...prev.overallAssessment, supervisorComments: e.target.value }
                }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Appraisal Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calculateSectionScore(formData.clinicalTeachingExcellence).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Clinical Teaching (40%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculateSectionScore(formData.professionalPractice).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Professional Practice (30%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {calculateSectionScore(formData.educationalLeadership).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Educational Leadership (20%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {calculateOverallScore().toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleSave} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

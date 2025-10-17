import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Save, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface DeanAppraisalFormProps {
  employeeId: string;
  cycleId: string;
  onSave: (data: any) => void;
}

interface DeanAppraisalData {
  id?: string;
  employeeId: string;
  cycleId: string;
  templateType: 'DEAN';
  stage: 'PLANNING' | 'MID_YEAR' | 'FINAL';
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'COMPLETED';
  
  // Employee Information
  employeeName: string;
  position: string;
  department: string;
  supervisorName: string;
  appraisalPeriod: string;
  
  // Section 1: Academic Leadership (35%)
  academicLeadership: {
    strategicPlanning: { score: number; comments: string };
    facultyDevelopment: { score: number; comments: string };
    programOversight: { score: number; comments: string };
    academicQuality: { score: number; comments: string };
    innovationLeadership: { score: number; comments: string };
  };
  
  // Section 2: Administrative Excellence (30%)
  administrativeExcellence: {
    budgetManagement: { score: number; comments: string };
    resourceAllocation: { score: number; comments: string };
    policyImplementation: { score: number; comments: string };
    operationalEfficiency: { score: number; comments: string };
    complianceManagement: { score: number; comments: string };
  };
  
  // Section 3: External Relations (20%)
  externalRelations: {
    stakeholderEngagement: { score: number; comments: string };
    communityOutreach: { score: number; comments: string };
    partnershipDevelopment: { score: number; comments: string };
    publicRepresentation: { score: number; comments: string };
    fundraising: { score: number; comments: string };
  };
  
  // Section 4: Research and Scholarship (15%)
  researchAndScholarship: {
    researchLeadership: { score: number; comments: string };
    scholarlyActivities: { score: number; comments: string };
    researchCollaboration: { score: number; comments: string };
    knowledgeTransfer: { score: number; comments: string };
    academicReputation: { score: number; comments: string };
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

export function DeanAppraisalForm({ employeeId, cycleId, onSave }: DeanAppraisalFormProps) {
  const [formData, setFormData] = useState<DeanAppraisalData>({
    employeeId,
    cycleId,
    templateType: 'DEAN',
    stage: 'PLANNING',
    status: 'DRAFT',
    employeeName: '',
    position: '',
    department: '',
    supervisorName: '',
    appraisalPeriod: '',
    academicLeadership: {
      strategicPlanning: { score: 0, comments: '' },
      facultyDevelopment: { score: 0, comments: '' },
      programOversight: { score: 0, comments: '' },
      academicQuality: { score: 0, comments: '' },
      innovationLeadership: { score: 0, comments: '' }
    },
    administrativeExcellence: {
      budgetManagement: { score: 0, comments: '' },
      resourceAllocation: { score: 0, comments: '' },
      policyImplementation: { score: 0, comments: '' },
      operationalEfficiency: { score: 0, comments: '' },
      complianceManagement: { score: 0, comments: '' }
    },
    externalRelations: {
      stakeholderEngagement: { score: 0, comments: '' },
      communityOutreach: { score: 0, comments: '' },
      partnershipDevelopment: { score: 0, comments: '' },
      publicRepresentation: { score: 0, comments: '' },
      fundraising: { score: 0, comments: '' }
    },
    researchAndScholarship: {
      researchLeadership: { score: 0, comments: '' },
      scholarlyActivities: { score: 0, comments: '' },
      researchCollaboration: { score: 0, comments: '' },
      knowledgeTransfer: { score: 0, comments: '' },
      academicReputation: { score: 0, comments: '' }
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

  const [currentSection, setCurrentSection] = useState('academicLeadership');
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
    const academicScore = calculateSectionScore(formData.academicLeadership) * 0.35;
    const adminScore = calculateSectionScore(formData.administrativeExcellence) * 0.30;
    const externalScore = calculateSectionScore(formData.externalRelations) * 0.20;
    const researchScore = calculateSectionScore(formData.researchAndScholarship) * 0.15;
    return academicScore + adminScore + externalScore + researchScore;
  };

  const handleScoreChange = (section: string, field: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof DeanAppraisalData],
        [field]: {
          ...(prev[section as keyof DeanAppraisalData] as any)[field],
          score
        }
      }
    }));
  };

  const handleCommentsChange = (section: string, field: string, comments: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof DeanAppraisalData],
        [field]: {
          ...(prev[section as keyof DeanAppraisalData] as any)[field],
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
          Score: {calculateSectionScore(formData[section as keyof DeanAppraisalData]).toFixed(1)}/5.0
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
                {renderScoreInput(section, field.key, (formData[section as keyof DeanAppraisalData] as any)[field.key]?.score || 0)}
              </div>
            </div>
            <Textarea
              placeholder={`Comments for ${field.label.toLowerCase()}...`}
              value={(formData[section as keyof DeanAppraisalData] as any)[field.key]?.comments || ''}
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
          <CardTitle className="text-2xl">Dean Performance Appraisal</CardTitle>
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
          { key: 'academicLeadership', label: 'Academic Leadership (35%)' },
          { key: 'administrativeExcellence', label: 'Administrative Excellence (30%)' },
          { key: 'externalRelations', label: 'External Relations (20%)' },
          { key: 'researchAndScholarship', label: 'Research & Scholarship (15%)' },
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

      {/* Academic Leadership Section */}
      {currentSection === 'academicLeadership' && renderSection(
        'Academic Leadership',
        'academicLeadership',
        [
          {
            key: 'strategicPlanning',
            label: 'Strategic Planning',
            description: 'Development and implementation of academic strategic plans and vision'
          },
          {
            key: 'facultyDevelopment',
            label: 'Faculty Development',
            description: 'Support and development of faculty members and academic staff'
          },
          {
            key: 'programOversight',
            label: 'Program Oversight',
            description: 'Management and oversight of academic programs and curriculum'
          },
          {
            key: 'academicQuality',
            label: 'Academic Quality',
            description: 'Maintenance and enhancement of academic standards and quality'
          },
          {
            key: 'innovationLeadership',
            label: 'Innovation Leadership',
            description: 'Leadership in academic innovation and educational technology'
          }
        ],
        35
      )}

      {/* Administrative Excellence Section */}
      {currentSection === 'administrativeExcellence' && renderSection(
        'Administrative Excellence',
        'administrativeExcellence',
        [
          {
            key: 'budgetManagement',
            label: 'Budget Management',
            description: 'Effective management of departmental budgets and financial resources'
          },
          {
            key: 'resourceAllocation',
            label: 'Resource Allocation',
            description: 'Fair and strategic allocation of resources and personnel'
          },
          {
            key: 'policyImplementation',
            label: 'Policy Implementation',
            description: 'Implementation of institutional policies and procedures'
          },
          {
            key: 'operationalEfficiency',
            label: 'Operational Efficiency',
            description: 'Streamlining operations and improving departmental efficiency'
          },
          {
            key: 'complianceManagement',
            label: 'Compliance Management',
            description: 'Ensuring compliance with regulations and accreditation standards'
          }
        ],
        30
      )}

      {/* External Relations Section */}
      {currentSection === 'externalRelations' && renderSection(
        'External Relations',
        'externalRelations',
        [
          {
            key: 'stakeholderEngagement',
            label: 'Stakeholder Engagement',
            description: 'Building relationships with key stakeholders and partners'
          },
          {
            key: 'communityOutreach',
            label: 'Community Outreach',
            description: 'Engagement with local and regional communities'
          },
          {
            key: 'partnershipDevelopment',
            label: 'Partnership Development',
            description: 'Developing strategic partnerships and collaborations'
          },
          {
            key: 'publicRepresentation',
            label: 'Public Representation',
            description: 'Representing the institution in public forums and events'
          },
          {
            key: 'fundraising',
            label: 'Fundraising',
            description: 'Securing external funding and resources for the department'
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
            key: 'researchLeadership',
            label: 'Research Leadership',
            description: 'Leading research initiatives and fostering research culture'
          },
          {
            key: 'scholarlyActivities',
            label: 'Scholarly Activities',
            description: 'Personal scholarly contributions and academic reputation'
          },
          {
            key: 'researchCollaboration',
            label: 'Research Collaboration',
            description: 'Facilitating research collaborations and partnerships'
          },
          {
            key: 'knowledgeTransfer',
            label: 'Knowledge Transfer',
            description: 'Translating research into practice and policy'
          },
          {
            key: 'academicReputation',
            label: 'Academic Reputation',
            description: 'Maintaining and enhancing institutional academic reputation'
          }
        ],
        15
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
                {calculateSectionScore(formData.academicLeadership).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Academic Leadership (35%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculateSectionScore(formData.administrativeExcellence).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Administrative (30%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {calculateSectionScore(formData.externalRelations).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">External Relations (20%)</div>
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

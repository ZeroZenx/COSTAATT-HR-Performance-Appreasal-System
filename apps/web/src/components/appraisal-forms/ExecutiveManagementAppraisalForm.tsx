import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Save, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ExecutiveManagementAppraisalFormProps {
  employeeId: string;
  cycleId: string;
  onSave: (data: any) => void;
}

interface ExecutiveManagementAppraisalData {
  id?: string;
  employeeId: string;
  cycleId: string;
  templateType: 'EXECUTIVE_MANAGEMENT';
  stage: 'PLANNING' | 'MID_YEAR' | 'FINAL';
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'COMPLETED';
  
  // Employee Information
  employeeName: string;
  position: string;
  department: string;
  supervisorName: string;
  appraisalPeriod: string;
  
  // Section 1: Strategic Leadership (35%)
  strategicLeadership: {
    visionDevelopment: { score: number; comments: string };
    strategicPlanning: { score: number; comments: string };
    organizationalAlignment: { score: number; comments: string };
    changeManagement: { score: number; comments: string };
    innovationLeadership: { score: number; comments: string };
  };
  
  // Section 2: Operational Excellence (30%)
  operationalExcellence: {
    performanceManagement: { score: number; comments: string };
    resourceOptimization: { score: number; comments: string };
    processImprovement: { score: number; comments: string };
    qualityAssurance: { score: number; comments: string };
    riskManagement: { score: number; comments: string };
  };
  
  // Section 3: Stakeholder Relations (20%)
  stakeholderRelations: {
    boardRelations: { score: number; comments: string };
    externalPartnerships: { score: number; comments: string };
    communityEngagement: { score: number; comments: string };
    governmentRelations: { score: number; comments: string };
    publicRepresentation: { score: number; comments: string };
  };
  
  // Section 4: Financial Management (15%)
  financialManagement: {
    budgetOversight: { score: number; comments: string };
    revenueGeneration: { score: number; comments: string };
    costControl: { score: number; comments: string };
    investmentStrategy: { score: number; comments: string };
    financialReporting: { score: number; comments: string };
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

export function ExecutiveManagementAppraisalForm({ employeeId, cycleId, onSave }: ExecutiveManagementAppraisalFormProps) {
  const [formData, setFormData] = useState<ExecutiveManagementAppraisalData>({
    employeeId,
    cycleId,
    templateType: 'EXECUTIVE_MANAGEMENT',
    stage: 'PLANNING',
    status: 'DRAFT',
    employeeName: '',
    position: '',
    department: '',
    supervisorName: '',
    appraisalPeriod: '',
    strategicLeadership: {
      visionDevelopment: { score: 0, comments: '' },
      strategicPlanning: { score: 0, comments: '' },
      organizationalAlignment: { score: 0, comments: '' },
      changeManagement: { score: 0, comments: '' },
      innovationLeadership: { score: 0, comments: '' }
    },
    operationalExcellence: {
      performanceManagement: { score: 0, comments: '' },
      resourceOptimization: { score: 0, comments: '' },
      processImprovement: { score: 0, comments: '' },
      qualityAssurance: { score: 0, comments: '' },
      riskManagement: { score: 0, comments: '' }
    },
    stakeholderRelations: {
      boardRelations: { score: 0, comments: '' },
      externalPartnerships: { score: 0, comments: '' },
      communityEngagement: { score: 0, comments: '' },
      governmentRelations: { score: 0, comments: '' },
      publicRepresentation: { score: 0, comments: '' }
    },
    financialManagement: {
      budgetOversight: { score: 0, comments: '' },
      revenueGeneration: { score: 0, comments: '' },
      costControl: { score: 0, comments: '' },
      investmentStrategy: { score: 0, comments: '' },
      financialReporting: { score: 0, comments: '' }
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

  const [currentSection, setCurrentSection] = useState('strategicLeadership');
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
    const strategicScore = calculateSectionScore(formData.strategicLeadership) * 0.35;
    const operationalScore = calculateSectionScore(formData.operationalExcellence) * 0.30;
    const stakeholderScore = calculateSectionScore(formData.stakeholderRelations) * 0.20;
    const financialScore = calculateSectionScore(formData.financialManagement) * 0.15;
    return strategicScore + operationalScore + stakeholderScore + financialScore;
  };

  const handleScoreChange = (section: string, field: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ExecutiveManagementAppraisalData],
        [field]: {
          ...(prev[section as keyof ExecutiveManagementAppraisalData] as any)[field],
          score
        }
      }
    }));
  };

  const handleCommentsChange = (section: string, field: string, comments: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ExecutiveManagementAppraisalData],
        [field]: {
          ...(prev[section as keyof ExecutiveManagementAppraisalData] as any)[field],
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
          Score: {calculateSectionScore(formData[section as keyof ExecutiveManagementAppraisalData]).toFixed(1)}/5.0
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
                {renderScoreInput(section, field.key, (formData[section as keyof ExecutiveManagementAppraisalData] as any)[field.key]?.score || 0)}
              </div>
            </div>
            <Textarea
              placeholder={`Comments for ${field.label.toLowerCase()}...`}
              value={(formData[section as keyof ExecutiveManagementAppraisalData] as any)[field.key]?.comments || ''}
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
          <CardTitle className="text-2xl">Executive Management Performance Appraisal</CardTitle>
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
          { key: 'strategicLeadership', label: 'Strategic Leadership (35%)' },
          { key: 'operationalExcellence', label: 'Operational Excellence (30%)' },
          { key: 'stakeholderRelations', label: 'Stakeholder Relations (20%)' },
          { key: 'financialManagement', label: 'Financial Management (15%)' },
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

      {/* Strategic Leadership Section */}
      {currentSection === 'strategicLeadership' && renderSection(
        'Strategic Leadership',
        'strategicLeadership',
        [
          {
            key: 'visionDevelopment',
            label: 'Vision Development',
            description: 'Development and communication of organizational vision and mission'
          },
          {
            key: 'strategicPlanning',
            label: 'Strategic Planning',
            description: 'Development and implementation of strategic plans and initiatives'
          },
          {
            key: 'organizationalAlignment',
            label: 'Organizational Alignment',
            description: 'Alignment of organizational activities with strategic objectives'
          },
          {
            key: 'changeManagement',
            label: 'Change Management',
            description: 'Leadership in organizational change and transformation'
          },
          {
            key: 'innovationLeadership',
            label: 'Innovation Leadership',
            description: 'Fostering innovation and creative problem-solving'
          }
        ],
        35
      )}

      {/* Operational Excellence Section */}
      {currentSection === 'operationalExcellence' && renderSection(
        'Operational Excellence',
        'operationalExcellence',
        [
          {
            key: 'performanceManagement',
            label: 'Performance Management',
            description: 'Effectiveness in managing organizational performance and outcomes'
          },
          {
            key: 'resourceOptimization',
            label: 'Resource Optimization',
            description: 'Optimal allocation and utilization of organizational resources'
          },
          {
            key: 'processImprovement',
            label: 'Process Improvement',
            description: 'Continuous improvement of organizational processes and systems'
          },
          {
            key: 'qualityAssurance',
            label: 'Quality Assurance',
            description: 'Maintenance and enhancement of quality standards'
          },
          {
            key: 'riskManagement',
            label: 'Risk Management',
            description: 'Identification and mitigation of organizational risks'
          }
        ],
        30
      )}

      {/* Stakeholder Relations Section */}
      {currentSection === 'stakeholderRelations' && renderSection(
        'Stakeholder Relations',
        'stakeholderRelations',
        [
          {
            key: 'boardRelations',
            label: 'Board Relations',
            description: 'Effective relationship management with board of directors'
          },
          {
            key: 'externalPartnerships',
            label: 'External Partnerships',
            description: 'Development and management of strategic partnerships'
          },
          {
            key: 'communityEngagement',
            label: 'Community Engagement',
            description: 'Engagement with local and regional communities'
          },
          {
            key: 'governmentRelations',
            label: 'Government Relations',
            description: 'Management of government and regulatory relationships'
          },
          {
            key: 'publicRepresentation',
            label: 'Public Representation',
            description: 'Representation of the organization in public forums'
          }
        ],
        20
      )}

      {/* Financial Management Section */}
      {currentSection === 'financialManagement' && renderSection(
        'Financial Management',
        'financialManagement',
        [
          {
            key: 'budgetOversight',
            label: 'Budget Oversight',
            description: 'Effective oversight of organizational budgets and financial planning'
          },
          {
            key: 'revenueGeneration',
            label: 'Revenue Generation',
            description: 'Development and implementation of revenue generation strategies'
          },
          {
            key: 'costControl',
            label: 'Cost Control',
            description: 'Implementation of cost control measures and efficiency initiatives'
          },
          {
            key: 'investmentStrategy',
            label: 'Investment Strategy',
            description: 'Strategic investment decisions and capital allocation'
          },
          {
            key: 'financialReporting',
            label: 'Financial Reporting',
            description: 'Accuracy and transparency in financial reporting'
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
                {calculateSectionScore(formData.strategicLeadership).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Strategic Leadership (35%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculateSectionScore(formData.operationalExcellence).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Operational Excellence (30%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {calculateSectionScore(formData.stakeholderRelations).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Stakeholder Relations (20%)</div>
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

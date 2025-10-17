import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Save, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface GeneralStaffAppraisalFormProps {
  employeeId: string;
  cycleId: string;
  onSave: (data: any) => void;
}

interface AppraisalData {
  id?: string;
  employeeId: string;
  cycleId: string;
  templateType: 'GENERAL_STAFF';
  stage: 'PLANNING' | 'MID_YEAR' | 'FINAL';
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'COMPLETED';
  
  // Employee Information
  employeeName: string;
  position: string;
  department: string;
  supervisorName: string;
  appraisalPeriod: string;
  
  // Section 1: Job Performance (60%)
  jobPerformance: {
    qualityOfWork: { score: number; comments: string };
    productivity: { score: number; comments: string };
    problemSolving: { score: number; comments: string };
    initiative: { score: number; comments: string };
    overallPerformance: { score: number; comments: string };
  };
  
  // Section 2: Core Competencies (30%)
  coreCompetencies: {
    communication: { score: number; comments: string };
    teamwork: { score: number; comments: string };
    adaptability: { score: number; comments: string };
    reliability: { score: number; comments: string };
    professionalDevelopment: { score: number; comments: string };
  };
  
  // Section 3: Goals and Objectives (10%)
  goalsAndObjectives: {
    goals: Array<{ id: string; description: string; status: string; comments: string }>;
    achievements: string;
    challenges: string;
    futureGoals: string;
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

export function GeneralStaffAppraisalForm({ employeeId, cycleId, onSave }: GeneralStaffAppraisalFormProps) {
  const [formData, setFormData] = useState<AppraisalData>({
    employeeId,
    cycleId,
    templateType: 'GENERAL_STAFF',
    stage: 'PLANNING',
    status: 'DRAFT',
    employeeName: '',
    position: '',
    department: '',
    supervisorName: '',
    appraisalPeriod: '',
    jobPerformance: {
      qualityOfWork: { score: 0, comments: '' },
      productivity: { score: 0, comments: '' },
      problemSolving: { score: 0, comments: '' },
      initiative: { score: 0, comments: '' },
      overallPerformance: { score: 0, comments: '' }
    },
    coreCompetencies: {
      communication: { score: 0, comments: '' },
      teamwork: { score: 0, comments: '' },
      adaptability: { score: 0, comments: '' },
      reliability: { score: 0, comments: '' },
      professionalDevelopment: { score: 0, comments: '' }
    },
    goalsAndObjectives: {
      goals: [],
      achievements: '',
      challenges: '',
      futureGoals: ''
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

  const [currentSection, setCurrentSection] = useState('jobPerformance');
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
    const jobPerformanceScore = calculateSectionScore(formData.jobPerformance) * 0.6;
    const coreCompetenciesScore = calculateSectionScore(formData.coreCompetencies) * 0.3;
    const goalsScore = formData.overallAssessment.overallRating * 0.1;
    return jobPerformanceScore + coreCompetenciesScore + goalsScore;
  };

  const handleScoreChange = (section: string, field: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof AppraisalData],
        [field]: {
          ...(prev[section as keyof AppraisalData] as any)[field],
          score
        }
      }
    }));
  };

  const handleCommentsChange = (section: string, field: string, comments: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof AppraisalData],
        [field]: {
          ...(prev[section as keyof AppraisalData] as any)[field],
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
          Score: {calculateSectionScore(formData[section as keyof AppraisalData]).toFixed(1)}/5.0
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
                {renderScoreInput(section, field.key, (formData[section as keyof AppraisalData] as any)[field.key]?.score || 0)}
              </div>
            </div>
            <Textarea
              placeholder={`Comments for ${field.label.toLowerCase()}...`}
              value={(formData[section as keyof AppraisalData] as any)[field.key]?.comments || ''}
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
          <CardTitle className="text-2xl">General Staff Performance Appraisal</CardTitle>
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
          { key: 'jobPerformance', label: 'Job Performance (60%)' },
          { key: 'coreCompetencies', label: 'Core Competencies (30%)' },
          { key: 'goalsAndObjectives', label: 'Goals & Objectives (10%)' },
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

      {/* Job Performance Section */}
      {currentSection === 'jobPerformance' && renderSection(
        'Job Performance',
        'jobPerformance',
        [
          {
            key: 'qualityOfWork',
            label: 'Quality of Work',
            description: 'Accuracy, thoroughness, and attention to detail in work output'
          },
          {
            key: 'productivity',
            label: 'Productivity',
            description: 'Efficiency and volume of work completed within deadlines'
          },
          {
            key: 'problemSolving',
            label: 'Problem Solving',
            description: 'Ability to identify, analyze, and resolve work-related issues'
          },
          {
            key: 'initiative',
            label: 'Initiative',
            description: 'Proactive approach to tasks and willingness to take on additional responsibilities'
          },
          {
            key: 'overallPerformance',
            label: 'Overall Performance',
            description: 'General performance level and contribution to department goals'
          }
        ],
        60
      )}

      {/* Core Competencies Section */}
      {currentSection === 'coreCompetencies' && renderSection(
        'Core Competencies',
        'coreCompetencies',
        [
          {
            key: 'communication',
            label: 'Communication Skills',
            description: 'Effectiveness in written and verbal communication'
          },
          {
            key: 'teamwork',
            label: 'Teamwork',
            description: 'Collaboration and cooperation with colleagues'
          },
          {
            key: 'adaptability',
            label: 'Adaptability',
            description: 'Flexibility and ability to handle change'
          },
          {
            key: 'reliability',
            label: 'Reliability',
            description: 'Dependability and consistency in meeting commitments'
          },
          {
            key: 'professionalDevelopment',
            label: 'Professional Development',
            description: 'Commitment to learning and skill improvement'
          }
        ],
        30
      )}

      {/* Goals and Objectives Section */}
      {currentSection === 'goalsAndObjectives' && (
        <Card>
          <CardHeader>
            <CardTitle>Goals and Objectives</CardTitle>
            <CardDescription>10% Weight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements
              </label>
              <Textarea
                placeholder="Describe key achievements during the appraisal period..."
                value={formData.goalsAndObjectives.achievements}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  goalsAndObjectives: { ...prev.goalsAndObjectives, achievements: e.target.value }
                }))}
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenges Faced
              </label>
              <Textarea
                placeholder="Describe any challenges encountered and how they were addressed..."
                value={formData.goalsAndObjectives.challenges}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  goalsAndObjectives: { ...prev.goalsAndObjectives, challenges: e.target.value }
                }))}
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Future Goals
              </label>
              <Textarea
                placeholder="Outline goals and objectives for the next appraisal period..."
                value={formData.goalsAndObjectives.futureGoals}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  goalsAndObjectives: { ...prev.goalsAndObjectives, futureGoals: e.target.value }
                }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calculateSectionScore(formData.jobPerformance).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Job Performance (60%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculateSectionScore(formData.coreCompetencies).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Core Competencies (30%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
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

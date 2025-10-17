import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Save, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface FacultyAppraisalFormProps {
  employeeId: string;
  cycleId: string;
  onSave: (data: any) => void;
}

interface FacultyAppraisalData {
  id?: string;
  employeeId: string;
  cycleId: string;
  templateType: 'FACULTY';
  stage: 'PLANNING' | 'MID_YEAR' | 'FINAL';
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'COMPLETED';
  
  // Employee Information
  employeeName: string;
  position: string;
  department: string;
  supervisorName: string;
  appraisalPeriod: string;
  
  // Section 1: Teaching Excellence (40%)
  teachingExcellence: {
    courseDesign: { score: number; comments: string };
    delivery: { score: number; comments: string };
    studentEngagement: { score: number; comments: string };
    assessmentMethods: { score: number; comments: string };
    curriculumDevelopment: { score: number; comments: string };
  };
  
  // Section 2: Research and Scholarship (30%)
  researchAndScholarship: {
    publications: { score: number; comments: string };
    researchProjects: { score: number; comments: string };
    conferencePresentations: { score: number; comments: string };
    grantWriting: { score: number; comments: string };
    scholarlyActivities: { score: number; comments: string };
  };
  
  // Section 3: Service and Leadership (20%)
  serviceAndLeadership: {
    committeeWork: { score: number; comments: string };
    communityService: { score: number; comments: string };
    mentoring: { score: number; comments: string };
    administrativeDuties: { score: number; comments: string };
    professionalMembership: { score: number; comments: string };
  };
  
  // Section 4: Professional Development (10%)
  professionalDevelopment: {
    continuingEducation: { score: number; comments: string };
    certifications: { score: number; comments: string };
    conferenceAttendance: { score: number; comments: string };
    skillDevelopment: { score: number; comments: string };
    careerAdvancement: { score: number; comments: string };
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

export function FacultyAppraisalForm({ employeeId, cycleId, onSave }: FacultyAppraisalFormProps) {
  const [formData, setFormData] = useState<FacultyAppraisalData>({
    employeeId,
    cycleId,
    templateType: 'FACULTY',
    stage: 'PLANNING',
    status: 'DRAFT',
    employeeName: '',
    position: '',
    department: '',
    supervisorName: '',
    appraisalPeriod: '',
    teachingExcellence: {
      courseDesign: { score: 0, comments: '' },
      delivery: { score: 0, comments: '' },
      studentEngagement: { score: 0, comments: '' },
      assessmentMethods: { score: 0, comments: '' },
      curriculumDevelopment: { score: 0, comments: '' }
    },
    researchAndScholarship: {
      publications: { score: 0, comments: '' },
      researchProjects: { score: 0, comments: '' },
      conferencePresentations: { score: 0, comments: '' },
      grantWriting: { score: 0, comments: '' },
      scholarlyActivities: { score: 0, comments: '' }
    },
    serviceAndLeadership: {
      committeeWork: { score: 0, comments: '' },
      communityService: { score: 0, comments: '' },
      mentoring: { score: 0, comments: '' },
      administrativeDuties: { score: 0, comments: '' },
      professionalMembership: { score: 0, comments: '' }
    },
    professionalDevelopment: {
      continuingEducation: { score: 0, comments: '' },
      certifications: { score: 0, comments: '' },
      conferenceAttendance: { score: 0, comments: '' },
      skillDevelopment: { score: 0, comments: '' },
      careerAdvancement: { score: 0, comments: '' }
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

  const [currentSection, setCurrentSection] = useState('teachingExcellence');
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
    const teachingScore = calculateSectionScore(formData.teachingExcellence) * 0.4;
    const researchScore = calculateSectionScore(formData.researchAndScholarship) * 0.3;
    const serviceScore = calculateSectionScore(formData.serviceAndLeadership) * 0.2;
    const developmentScore = calculateSectionScore(formData.professionalDevelopment) * 0.1;
    return teachingScore + researchScore + serviceScore + developmentScore;
  };

  const handleScoreChange = (section: string, field: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FacultyAppraisalData],
        [field]: {
          ...(prev[section as keyof FacultyAppraisalData] as any)[field],
          score
        }
      }
    }));
  };

  const handleCommentsChange = (section: string, field: string, comments: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FacultyAppraisalData],
        [field]: {
          ...(prev[section as keyof FacultyAppraisalData] as any)[field],
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
          Score: {calculateSectionScore(formData[section as keyof FacultyAppraisalData]).toFixed(1)}/5.0
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
                {renderScoreInput(section, field.key, (formData[section as keyof FacultyAppraisalData] as any)[field.key]?.score || 0)}
              </div>
            </div>
            <Textarea
              placeholder={`Comments for ${field.label.toLowerCase()}...`}
              value={(formData[section as keyof FacultyAppraisalData] as any)[field.key]?.comments || ''}
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
          <CardTitle className="text-2xl">Faculty Performance Appraisal</CardTitle>
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
          { key: 'teachingExcellence', label: 'Teaching Excellence (40%)' },
          { key: 'researchAndScholarship', label: 'Research & Scholarship (30%)' },
          { key: 'serviceAndLeadership', label: 'Service & Leadership (20%)' },
          { key: 'professionalDevelopment', label: 'Professional Development (10%)' },
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

      {/* Teaching Excellence Section */}
      {currentSection === 'teachingExcellence' && renderSection(
        'Teaching Excellence',
        'teachingExcellence',
        [
          {
            key: 'courseDesign',
            label: 'Course Design and Development',
            description: 'Quality of course materials, curriculum design, and learning objectives'
          },
          {
            key: 'delivery',
            label: 'Teaching Delivery',
            description: 'Effectiveness of teaching methods, presentation skills, and classroom management'
          },
          {
            key: 'studentEngagement',
            label: 'Student Engagement',
            description: 'Ability to engage students, foster participation, and create interactive learning'
          },
          {
            key: 'assessmentMethods',
            label: 'Assessment Methods',
            description: 'Fairness and effectiveness of evaluation methods and feedback'
          },
          {
            key: 'curriculumDevelopment',
            label: 'Curriculum Development',
            description: 'Contribution to program development and curriculum improvement'
          }
        ],
        40
      )}

      {/* Research and Scholarship Section */}
      {currentSection === 'researchAndScholarship' && renderSection(
        'Research and Scholarship',
        'researchAndScholarship',
        [
          {
            key: 'publications',
            label: 'Publications',
            description: 'Quality and quantity of scholarly publications and research output'
          },
          {
            key: 'researchProjects',
            label: 'Research Projects',
            description: 'Active research projects, methodology, and contribution to knowledge'
          },
          {
            key: 'conferencePresentations',
            label: 'Conference Presentations',
            description: 'Participation in academic conferences and professional presentations'
          },
          {
            key: 'grantWriting',
            label: 'Grant Writing',
            description: 'Success in securing research funding and grant applications'
          },
          {
            key: 'scholarlyActivities',
            label: 'Scholarly Activities',
            description: 'Peer review, editorial work, and other academic contributions'
          }
        ],
        30
      )}

      {/* Service and Leadership Section */}
      {currentSection === 'serviceAndLeadership' && renderSection(
        'Service and Leadership',
        'serviceAndLeadership',
        [
          {
            key: 'committeeWork',
            label: 'Committee Work',
            description: 'Participation in departmental and institutional committees'
          },
          {
            key: 'communityService',
            label: 'Community Service',
            description: 'Engagement with external communities and public service'
          },
          {
            key: 'mentoring',
            label: 'Mentoring',
            description: 'Mentoring of students, junior faculty, and colleagues'
          },
          {
            key: 'administrativeDuties',
            label: 'Administrative Duties',
            description: 'Effectiveness in administrative roles and responsibilities'
          },
          {
            key: 'professionalMembership',
            label: 'Professional Membership',
            description: 'Active participation in professional organizations'
          }
        ],
        20
      )}

      {/* Professional Development Section */}
      {currentSection === 'professionalDevelopment' && renderSection(
        'Professional Development',
        'professionalDevelopment',
        [
          {
            key: 'continuingEducation',
            label: 'Continuing Education',
            description: 'Commitment to ongoing learning and skill development'
          },
          {
            key: 'certifications',
            label: 'Certifications',
            description: 'Pursuit of relevant professional certifications'
          },
          {
            key: 'conferenceAttendance',
            label: 'Conference Attendance',
            description: 'Participation in professional development events'
          },
          {
            key: 'skillDevelopment',
            label: 'Skill Development',
            description: 'Development of new skills and competencies'
          },
          {
            key: 'careerAdvancement',
            label: 'Career Advancement',
            description: 'Progress toward career goals and professional growth'
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
                {calculateSectionScore(formData.teachingExcellence).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Teaching (40%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculateSectionScore(formData.researchAndScholarship).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Research (30%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {calculateSectionScore(formData.serviceAndLeadership).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Service (20%)</div>
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

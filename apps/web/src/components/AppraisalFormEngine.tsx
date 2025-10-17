import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Save, Send, Calculator, CheckCircle, AlertCircle } from 'lucide-react';

interface Competency {
  id: string;
  title: string;
  description: string;
  category: string;
  code: string;
  cluster?: {
    id: string;
    name: string;
  };
}


interface AppraisalFormData {
  sections: {
    [sectionId: string]: {
      competencies: {
        [competencyId: string]: {
          score: number;
          evidence: string;
          comments: string;
        };
      };
    };
  };
  overallComments?: string;
}

interface AppraisalFormEngineProps {
  templateId: string;
  employeeId?: string;
  cycleId?: string;
  appraisalId?: string;
  onSave?: (data: AppraisalFormData) => void;
  onSubmit?: (data: AppraisalFormData) => void;
  readOnly?: boolean;
}

export function AppraisalFormEngine({
  templateId,
  employeeId: _employeeId,
  cycleId: _cycleId,
  appraisalId,
  onSave,
  onSubmit,
  readOnly = false
}: AppraisalFormEngineProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AppraisalFormData>({ sections: {} });
  const [liveScore, setLiveScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch template with competencies
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const response = await fetch(`http://10.2.1.27:3000/templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      return response.json();
    },
    enabled: !!templateId,
  });

  // Fetch competencies for the template
  const { data: competencies, isLoading: competenciesLoading } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/competencies');
      if (!response.ok) throw new Error('Failed to fetch competencies');
      return response.json();
    },
  });

  // Fetch existing appraisal data if editing
  const { data: existingAppraisal } = useQuery({
    queryKey: ['appraisal', appraisalId],
    queryFn: async () => {
      if (!appraisalId) return null;
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${appraisalId}`);
      if (!response.ok) throw new Error('Failed to fetch appraisal');
      return response.json();
    },
    enabled: !!appraisalId,
  });

  // Initialize form data when template or existing appraisal loads
  useEffect(() => {
    if (template && competencies) {
      const initialData: AppraisalFormData = { sections: {} };
      
      if (template.configJson?.sections) {
        template.configJson.sections.forEach((section: any) => {
          initialData.sections[section.key] = {
            competencies: {}
          };
          
          // Map competencies to sections based on template configuration
          section.competencies?.forEach((comp: any) => {
            const competency = competencies.find((c: Competency) => c.code === comp.code);
            if (competency) {
              initialData.sections[section.key].competencies[competency.id] = {
                score: 0,
                evidence: '',
                comments: ''
              };
            }
          });
        });
      }
      
      // Load existing data if available
      if (existingAppraisal?.managerReviewData) {
        try {
          const existingData = JSON.parse(existingAppraisal.managerReviewData);
          setFormData({ ...initialData, ...existingData });
        } catch (error) {
          setFormData(initialData);
        }
      } else {
        setFormData(initialData);
      }
    }
  }, [template, competencies, existingAppraisal]);

  // Calculate live score whenever form data changes
  useEffect(() => {
    if (!template?.configJson?.sections) return;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    template.configJson.sections.forEach((section: any) => {
      const sectionData = formData.sections[section.key];
      if (sectionData) {
        let sectionScore = 0;
        let competencyCount = 0;
        
        Object.values(sectionData.competencies).forEach(comp => {
          if (comp.score > 0) {
            sectionScore += comp.score;
            competencyCount++;
          }
        });
        
        if (competencyCount > 0) {
          const avgSectionScore = sectionScore / competencyCount;
          totalWeightedScore += (avgSectionScore / 5) * section.weight;
          totalWeight += section.weight;
        }
      }
    });
    
    const finalScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
    setLiveScore(finalScore);
  }, [formData, template]);

  const updateCompetencyScore = (sectionKey: string, competencyId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          competencies: {
            ...prev.sections[sectionKey]?.competencies,
            [competencyId]: {
              ...prev.sections[sectionKey]?.competencies?.[competencyId],
              [field]: value
            }
          }
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else if (appraisalId) {
        // Save to backend
        await fetch(`http://10.2.1.27:3000/appraisals/${appraisalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData,
            overallScore: liveScore,
            status: 'DRAFT'
          }),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
    } catch (error) {
      console.error('Error saving appraisal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else if (appraisalId) {
        // Submit to backend
        await fetch(`http://10.2.1.27:3000/appraisals/${appraisalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData,
            overallScore: liveScore,
            status: 'IN_REVIEW'
          }),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
    } catch (error) {
      console.error('Error submitting appraisal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (templateLoading || competenciesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appraisal template...</p>
        </div>
      </div>
    );
  }

  if (!template || !competencies) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load appraisal template</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-3 space-y-6">
        {template.configJson?.sections?.map((section: any) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{section.title}</span>
                <Badge variant="outline">Weight: {section.weight}%</Badge>
              </CardTitle>
              {section.description && (
                <CardDescription>{section.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {section.competencies?.map((comp: any) => {
                const competency = competencies.find((c: Competency) => c.code === comp.code);
                if (!competency) return null;

                const competencyData = formData.sections[section.key]?.competencies[competency.id] || {
                  score: 0,
                  evidence: '',
                  comments: ''
                };

                return (
                  <div key={competency.id} className="border rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-lg">{competency.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{competency.description}</p>
                      {competency.cluster && (
                        <Badge variant="secondary" className="mt-2">
                          {competency.cluster.name}
                        </Badge>
                      )}
                    </div>

                    {/* Score Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Performance Rating (1-5 Scale)
                      </label>
                      <Select
                        value={competencyData.score.toString()}
                        onValueChange={(value) => updateCompetencyScore(section.key, competency.id, 'score', parseInt(value))}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Not Rated</SelectItem>
                          <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                          <SelectItem value="2">2 - Needs Improvement</SelectItem>
                          <SelectItem value="3">3 - Meets Expectations</SelectItem>
                          <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                          <SelectItem value="5">5 - Outstanding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Evidence */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidence & Examples
                      </label>
                      <Textarea
                        value={competencyData.evidence}
                        onChange={(e) => updateCompetencyScore(section.key, competency.id, 'evidence', e.target.value)}
                        placeholder="Provide specific examples and evidence of performance..."
                        rows={3}
                        disabled={readOnly}
                      />
                    </div>

                    {/* Comments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments & Feedback
                      </label>
                      <Textarea
                        value={competencyData.comments}
                        onChange={(e) => updateCompetencyScore(section.key, competency.id, 'comments', e.target.value)}
                        placeholder="Additional comments or recommendations..."
                        rows={2}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {/* Overall Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Comments</CardTitle>
            <CardDescription>Provide overall feedback and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.overallComments || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, overallComments: e.target.value }))}
              placeholder="Overall performance summary and recommendations..."
              rows={4}
              disabled={readOnly}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!readOnly && (
          <div className="flex justify-end space-x-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || liveScore === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        )}
      </div>

      {/* Live Scoring Panel */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Live Scoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-3xl font-bold p-4 rounded-lg ${getScoreColor(liveScore)}`}>
                {liveScore}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Overall Performance Score</p>
              <Progress value={liveScore} className="mt-2" />
            </div>

            {/* Section Breakdown */}
            <div>
              <h4 className="font-medium mb-3">Section Breakdown</h4>
              <div className="space-y-2">
                {template.configJson?.sections?.map((section: any) => {
                  const sectionData = formData.sections[section.key];
                  let sectionScore = 0;
                  let competencyCount = 0;
                  
                  if (sectionData) {
                    Object.values(sectionData.competencies).forEach(comp => {
                      if (comp.score > 0) {
                        sectionScore += comp.score;
                        competencyCount++;
                      }
                    });
                  }
                  
                  const avgScore = competencyCount > 0 ? Math.round((sectionScore / competencyCount / 5) * 100) : 0;
                  
                  return (
                    <div key={section.key} className="flex justify-between items-center text-sm">
                      <span className="truncate">{section.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${getScoreColor(avgScore)}`}>
                          {avgScore}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {section.weight}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2">
                {liveScore > 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Ready to Submit</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">Complete Sections</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

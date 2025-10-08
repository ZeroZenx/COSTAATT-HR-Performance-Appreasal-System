import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAutoSave } from '../hooks/useAutoSave';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { ScoringEngine, ScoringSection, ScoringResult } from '../lib/scoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Calculator, 
  Save, 
  Send,
  FileText,
  Target,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';

// Types for appraisal builder
interface AppraisalSection {
  key: string;
  title: string;
  weight: number;
  items: AppraisalItem[];
}

interface AppraisalItem {
  key: string;
  title: string;
  scale: string;
  weight: number;
  description?: string;
  evidence?: string;
  comments?: string;
}

interface AppraisalBuilderProps {
  templateId: string;
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
}

// Form validation schema
const appraisalSchema = z.object({
  sections: z.array(z.object({
    key: z.string(),
    title: z.string(),
    weight: z.number(),
    items: z.array(z.object({
      key: z.string(),
      title: z.string(),
      scale: z.string(),
      weight: z.number(),
      score: z.number().min(1).max(5).optional(),
      evidence: z.string().optional(),
      comments: z.string().optional(),
    }))
  }))
});

type AppraisalFormData = z.infer<typeof appraisalSchema>;

export function AppraisalBuilder({ 
  templateId, 
  onSave, 
  onSubmit 
}: AppraisalBuilderProps) {
  const [template, setTemplate] = useState<AppraisalSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState({
    sectionScores: {} as Record<string, number>,
    weightedScores: {} as Record<string, number>,
    finalScore: 0,
    ratingBand: ''
  });

  const form = useForm<AppraisalFormData>({
    resolver: zodResolver(appraisalSchema),
    defaultValues: {
      sections: []
    }
  });

  useFieldArray({
    control: form.control,
    name: 'sections'
  });

  // Auto-save functionality
  const autoSave = useAutoSave({
    saveFunction: async (data) => {
      if (onSave) {
        onSave(data);
        return data;
      }
      return data;
    },
    delay: 3000,
    enabled: true,
    showToast: true,
    toastMessage: 'Appraisal saved automatically'
  });

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        // This would be an API call to get template data
        // For now, using mock data based on the template structure
        const mockTemplate: AppraisalSection[] = [
          {
            key: 'leadership',
            title: 'Leadership & Management',
            weight: 0.30,
            items: [
              {
                key: 'strategic_vision',
                title: 'Strategic Vision & Planning',
                scale: '1-5',
                weight: 0.40,
                description: 'Demonstrates clear strategic thinking and planning capabilities'
              },
              {
                key: 'team_leadership',
                title: 'Team Leadership & Development',
                scale: '1-5',
                weight: 0.30,
                description: 'Effectively leads and develops team members'
              },
              {
                key: 'decision_making',
                title: 'Decision Making & Problem Solving',
                scale: '1-5',
                weight: 0.30,
                description: 'Makes sound decisions and solves problems effectively'
              }
            ]
          },
          {
            key: 'academic_excellence',
            title: 'Academic Excellence',
            weight: 0.25,
            items: [
              {
                key: 'curriculum_development',
                title: 'Curriculum Development & Innovation',
                scale: '1-5',
                weight: 0.50,
                description: 'Contributes to curriculum development and innovation'
              },
              {
                key: 'quality_assurance',
                title: 'Quality Assurance & Standards',
                scale: '1-5',
                weight: 0.50,
                description: 'Maintains high quality standards in academic work'
              }
            ]
          },
          {
            key: 'stakeholder_engagement',
            title: 'Stakeholder Engagement',
            weight: 0.20,
            items: [
              {
                key: 'community_outreach',
                title: 'Community Outreach & Partnerships',
                scale: '1-5',
                weight: 0.50,
                description: 'Engages with community and builds partnerships'
              },
              {
                key: 'student_engagement',
                title: 'Student Engagement & Support',
                scale: '1-5',
                weight: 0.50,
                description: 'Effectively engages and supports students'
              }
            ]
          },
          {
            key: 'administrative_effectiveness',
            title: 'Administrative Effectiveness',
            weight: 0.25,
            items: [
              {
                key: 'resource_management',
                title: 'Resource Management & Budgeting',
                scale: '1-5',
                weight: 0.40,
                description: 'Effectively manages resources and budgets'
              },
              {
                key: 'compliance',
                title: 'Compliance & Governance',
                scale: '1-5',
                weight: 0.30,
                description: 'Ensures compliance with policies and governance'
              },
              {
                key: 'technology_adoption',
                title: 'Technology Adoption & Innovation',
                scale: '1-5',
                weight: 0.30,
                description: 'Embraces and implements new technologies'
              }
            ]
          }
        ];

        setTemplate(mockTemplate);
        form.reset({ sections: mockTemplate });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading template:', error);
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, form]);

  // Calculate scores when form data changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.sections) {
        calculateScores(data.sections as AppraisalSection[]);
        // Trigger auto-save when form data changes
        autoSave.triggerSave(data);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, autoSave]);

  const calculateScores = (sections: AppraisalSection[]) => {
    // Convert to scoring format
    const scoringSections: ScoringSection[] = sections.map(section => ({
      key: section.key,
      title: section.title,
      weight: section.weight,
      items: section.items.map(item => ({
        key: item.key,
        title: item.title,
        score: (item as any).score || 0,
        weight: item.weight,
        scale: item.scale
      }))
    }));

    // Use enhanced scoring engine
    const result = ScoringEngine.calculateScores(scoringSections);
    
    setScores({
      sectionScores: result.sectionScores,
      weightedScores: result.weightedScores,
      finalScore: result.finalScore,
      ratingBand: result.ratingBand
    });
  };

  const getRatingBand = (score: number): string => {
    if (score >= 4.5) return 'Outstanding';
    if (score >= 3.5) return 'Exceeds Expectations';
    if (score >= 2.5) return 'Meets Expectations';
    if (score >= 1.5) return 'Below Expectations';
    return 'Unsatisfactory';
  };

  const handleSave = () => {
    const data = form.getValues();
    onSave?.(data);
  };

  const handleSubmit = () => {
    const data = form.getValues();
    onSubmit?.(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appraisal template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Appraisal Builder</h1>
          <p className="text-gray-600 mt-2">Complete the performance evaluation with live scoring</p>
          <div className="mt-3">
            <AutoSaveIndicator 
              isSaving={autoSave.isSaving}
              lastSaved={autoSave.lastSaved}
              isError={autoSave.isError}
              error={autoSave.error}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Sections */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="leadership" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 p-1 bg-gray-100 rounded-lg">
              {template.map((section) => (
                <TabsTrigger 
                  key={section.key} 
                  value={section.key}
                  className="px-2 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm truncate"
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {template.map((section) => (
              <TabsContent key={section.key} value={section.key} className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between text-xl">
                      {section.title}
                      <Badge variant="secondary" className="text-sm">
                        Weight: {(section.weight * 100).toFixed(0)}%
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Score each item on a scale of 1-5
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {section.items.map((item, itemIndex) => (
                      <div key={item.key} className="space-y-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Label className="text-base font-medium">
                              {item.title}
                            </Label>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">
                                Weight: {(item.weight * 100).toFixed(0)}%
                              </Badge>
                              <Badge variant="outline">
                                Scale: {item.scale}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div>
                            <Label htmlFor={`${section.key}.${item.key}.score`} className="text-sm font-medium">
                              Score (1-5)
                            </Label>
                            <Select
                              value={form.watch(`sections.${template.indexOf(section)}.items.${itemIndex}.score`)?.toString() || ''}
                              onValueChange={(value: string) => 
                                form.setValue(`sections.${template.indexOf(section)}.items.${itemIndex}.score`, parseInt(value))
                              }
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select score" />
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
                        </div>

                        <div className="space-y-6 mt-6">
                          <div>
                            <Label htmlFor={`${section.key}.${item.key}.evidence`} className="text-sm font-medium">
                              Evidence & Examples
                            </Label>
                            <Textarea
                              id={`${section.key}.${item.key}.evidence`}
                              placeholder="Provide specific examples and evidence..."
                              value={form.watch(`sections.${template.indexOf(section)}.items.${itemIndex}.evidence`) || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                                form.setValue(`sections.${template.indexOf(section)}.items.${itemIndex}.evidence`, e.target.value)
                              }
                              rows={3}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${section.key}.${item.key}.comments`} className="text-sm font-medium">
                              Comments & Feedback
                            </Label>
                            <Textarea
                              id={`${section.key}.${item.key}.comments`}
                              placeholder="Add comments and feedback..."
                              value={form.watch(`sections.${template.indexOf(section)}.items.${itemIndex}.comments`) || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                                form.setValue(`sections.${template.indexOf(section)}.items.${itemIndex}.comments`, e.target.value)
                              }
                              rows={2}
                              className="mt-2"
                            />
                          </div>
                        </div>

                        {itemIndex < section.items.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Panel - Live Scoring */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Live Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Live Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {scores.finalScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {scores.ratingBand}
                  </div>
                  <Progress 
                    value={(scores.finalScore / 5) * 100} 
                    className="mt-2"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Section Breakdown</h4>
                  {template.map((section) => (
                    <div key={section.key} className="flex justify-between items-center text-sm">
                      <span className="truncate">{section.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {scores.sectionScores[section.key]?.toFixed(1) || '0.0'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {(section.weight * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Items Completed</span>
                    <span className="font-medium">
                      {template.reduce((total, section) => 
                        total + section.items.filter(item => 
                          form.watch(`sections.${template.indexOf(section)}.items.${section.items.indexOf(item)}.score`)
                        ).length, 0
                      )} / {template.reduce((total, section) => total + section.items.length, 0)}
                    </span>
                  </div>
                  <Progress 
                    value={
                      (template.reduce((total, section) => 
                        total + section.items.filter(item => 
                          form.watch(`sections.${template.indexOf(section)}.items.${section.items.indexOf(item)}.score`)
                        ).length, 0
                      ) / template.reduce((total, section) => total + section.items.length, 0)) * 100
                    } 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Evidence
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Request Feedback
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

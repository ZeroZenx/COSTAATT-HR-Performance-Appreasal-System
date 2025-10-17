import { useState } from 'react';
import { Plus, Trash2, Eye, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  weight: number;
  type: 'competencies' | 'goals' | 'evaluations' | 'custom';
  questions: TemplateQuestion[];
}

interface TemplateQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'yes_no';
  required: boolean;
  options?: string[];
  weight?: number;
}

interface TemplateBuilderProps {
  template?: any;
  onSave: (template: any) => void;
  onCancel: () => void;
}

export function TemplateBuilder({ template, onSave, onCancel }: TemplateBuilderProps) {
  const [templateData, setTemplateData] = useState({
    name: template?.name || '',
    displayName: template?.displayName || '',
    type: template?.type || 'FACULTY',
    version: template?.version || '1.0',
    description: template?.description || '',
    sections: template?.sections || [
      {
        id: '1',
        title: 'Functional Competencies',
        description: 'Core job-related competencies',
        weight: 60,
        type: 'competencies',
        questions: []
      }
    ]
  });

  const [activeSection, setActiveSection] = useState('1');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const addSection = () => {
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      title: 'New Section',
      description: '',
      weight: 0,
      type: 'custom',
      questions: []
    };
    
    setTemplateData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSection(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    setTemplateData(prev => ({
      ...prev,
      sections: prev.sections.map((section: any) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId: string) => {
    setTemplateData(prev => ({
      ...prev,
      sections: prev.sections.filter((section: any) => section.id !== sectionId)
    }));
    
    if (activeSection === sectionId) {
      const remainingSections = templateData.sections.filter((s: any) => s.id !== sectionId);
      setActiveSection(remainingSections[0]?.id || '');
    }
  };

  const addQuestion = (sectionId: string) => {
    const newQuestion: TemplateQuestion = {
      id: Date.now().toString(),
      text: 'New Question',
      type: 'rating',
      required: true,
      weight: 1
    };

    updateSection(sectionId, {
      questions: [...(templateData.sections.find((s: any) => s.id === sectionId)?.questions || []), newQuestion]
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<TemplateQuestion>) => {
    updateSection(sectionId, {
      questions: templateData.sections
        .find((s: any) => s.id === sectionId)
        ?.questions.map((q: any) => q.id === questionId ? { ...q, ...updates } : q) || []
    });
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    updateSection(sectionId, {
      questions: templateData.sections
        .find((s: any) => s.id === sectionId)
        ?.questions.filter((q: any) => q.id !== questionId) || []
    });
  };

  const handleSave = () => {
    const configJson = {
      sections: templateData.sections,
      metadata: {
        version: templateData.version,
        description: templateData.description,
        totalWeight: templateData.sections.reduce((sum: number, section: any) => sum + section.weight, 0)
      }
    };

    onSave({
      ...templateData,
      configJson,
      published: false,
      active: true
    });
  };

  // const activeSectionData = templateData.sections.find((s: any) => s.id === activeSection);

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Template Preview</h3>
          <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
            <X className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
        </div>
        
        <TemplatePreview template={templateData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Header */}
      <Card>
        <CardHeader>
          <CardTitle>Template Configuration</CardTitle>
          <CardDescription>Configure the basic settings for your appraisal template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <Input
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., faculty-appraisal-v1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <Input
                value={templateData.displayName}
                onChange={(e) => setTemplateData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., Faculty Performance Appraisal"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Select value={templateData.type} onValueChange={(value) => setTemplateData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="DEAN">Dean</SelectItem>
                  <SelectItem value="CLINICAL_INSTRUCTOR">Clinical Instructor</SelectItem>
                  <SelectItem value="EXECUTIVE_MANAGEMENT">Executive Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
              <Input
                value={templateData.version}
                onChange={(e) => setTemplateData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Textarea
              value={templateData.description}
              onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this template's purpose and usage..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Template Sections</CardTitle>
              <CardDescription>Define the sections and questions for your appraisal template</CardDescription>
            </div>
            <Button onClick={addSection}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="grid w-full grid-cols-4">
              {templateData.sections.map((section: any, index: number) => (
                <TabsTrigger key={section.id} value={section.id}>
                  Section {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {templateData.sections.map((section: any) => (
              <TabsContent key={section.id} value={section.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium">{section.title}</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSection(section.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                    <Input
                      type="number"
                      value={section.weight}
                      onChange={(e) => updateSection(section.id, { weight: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    value={section.description}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Type</label>
                  <Select value={section.type} onValueChange={(value: any) => updateSection(section.id, { type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competencies">Competencies</SelectItem>
                      <SelectItem value="goals">Goals & Objectives</SelectItem>
                      <SelectItem value="evaluations">Student Evaluations</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Questions */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">Questions</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestion(section.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  
                  {section.questions.map((question: any) => (
                    <Card key={question.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Input
                              value={question.text}
                              onChange={(e) => updateQuestion(section.id, question.id, { text: e.target.value })}
                              placeholder="Question text..."
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteQuestion(section.id, question.id)}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <Select value={question.type} onValueChange={(value: any) => updateQuestion(section.id, question.id, { type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rating">Rating Scale</SelectItem>
                                <SelectItem value="text">Text Response</SelectItem>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="yes_no">Yes/No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                            <Input
                              type="number"
                              value={question.weight || 1}
                              onChange={(e) => updateQuestion(section.id, question.id, { weight: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(section.id, question.id, { required: e.target.checked })}
                              className="mr-2"
                            />
                            Required
                          </label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
}

// Template Preview Component
function TemplatePreview({ template }: { template: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{template.displayName}</h2>
        <p className="text-gray-600">{template.description}</p>
        <div className="flex justify-center gap-4 mt-2">
          <Badge variant="outline">{template.type}</Badge>
          <Badge variant="outline">Version {template.version}</Badge>
        </div>
      </div>
      
      {template.sections.map((section: any) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{section.title}</span>
              <Badge variant="secondary">{section.weight}%</Badge>
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.questions.map((question: any) => (
                <div key={question.id} className="border-l-4 border-purple-200 pl-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        {question.text}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      <div className="mt-2">
                        {question.type === 'rating' && (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(score => (
                              <div key={score} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                                {score}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'text' && (
                          <div className="w-full h-20 border border-gray-300 rounded p-2 bg-gray-50">
                            [Text response area]
                          </div>
                        )}
                        {question.type === 'yes_no' && (
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input type="radio" name={`q-${question.id}`} className="mr-2" />
                              Yes
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name={`q-${question.id}`} className="mr-2" />
                              No
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {question.weight}x
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

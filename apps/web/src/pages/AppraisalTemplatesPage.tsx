import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Eye, Copy, Settings, Edit, Play, Pause, Archive, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Layout } from '../components/Layout';
import { TemplateBuilder } from '../components/TemplateBuilder';
import { TemplateImportExport, TemplateBackup } from '../components/TemplateImportExport';
import { TemplateAnalytics } from '../components/TemplateAnalytics';
import { templatesApi } from '../lib/api';
import { ScoringConfig } from '@costaatt/shared';
import { useToast } from '../components/ui/toast';

interface AppraisalTemplate {
  id: string;
  name: string;
  type: string;
  displayName?: string;
  version?: string;
  published?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  configJson?: any;

  category?: {
    id: string;
    name: string;
  };
  sections?: any[];
}

const TEMPLATE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'FACULTY', label: 'Faculty' },
  { value: 'GENERAL_STAFF', label: 'General Staff' },
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'EXECUTIVE_MANAGEMENT', label: 'Executive Management' },
  { value: 'CLINICAL', label: 'Clinical Instructor' },
  { value: 'CLINICAL_INSTRUCTOR', label: 'Clinical Instructor (Legacy)' },
  { value: 'DEAN', label: 'Dean' },
];

const DEFAULT_SCORING_CONFIGS: Record<string, ScoringConfig> = {
  DEAN: {
    denominators: {
      functional: 117,
      core: 99,
      projects: 12,
    },
    weights: {
      functional: 0.5,
      core: 0.3,
      projects: 0.2,
    },
    maxScores: {
      functional: 117,
      core: 99,
      projects: 12,
    },
  },
  FACULTY: {
    denominators: {
      functional: 114,
      core: 99,
      studentEvaluations: 50,
      projects: 12,
    },
    weights: {
      functional: 0.5,
      core: 0.3,
      studentEvaluations: 0.2,
      projects: 0.0,
    },
    maxScores: {
      functional: 114,
      core: 99,
      studentEvaluations: 50,
      projects: 12,
    },
  },
  CLINICAL: {
    denominators: {
      functional: 81,
      core: 72,
      studentEvaluations: 30,
    },
    weights: {
      functional: 0.6,
      core: 0.2,
      studentEvaluations: 0.2,
    },
    maxScores: {
      functional: 81,
      core: 72,
      studentEvaluations: 30,
    },
  },
  CLINICAL_INSTRUCTOR: {
    denominators: {
      functional: 81,
      core: 72,
      studentEvaluations: 30,
    },
    weights: {
      functional: 0.6,
      core: 0.2,
      studentEvaluations: 0.2,
    },
    maxScores: {
      functional: 81,
      core: 72,
      studentEvaluations: 30,
    },
  },
  EXECUTIVE: {
    denominators: { overall: 100 },
    weights: { overall: 1 },
    maxScores: { overall: 100 },
  },
  EXECUTIVE_MANAGEMENT: {
    denominators: { overall: 100 },
    weights: { overall: 1 },
    maxScores: { overall: 100 },
  },
  GENERAL_STAFF: {
    denominators: { overall: 100 },
    weights: { overall: 1 },
    maxScores: { overall: 100 },
  },
};

const ensureWeightsSumToOne = <T extends ScoringConfig>(config: T): T => {
  const totalWeight = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);

  if (totalWeight === 0) {
    return {
      ...config,
      weights: { default: 1 },
      denominators: { default: 100 },
      maxScores: { default: 100 },
    };
  }

  if (Math.abs(totalWeight - 1) < 0.001) {
    return config;
  }

  const normalizedWeights = Object.entries(config.weights).reduce<Record<string, number>>((acc, [key, value]) => {
    acc[key] = value / totalWeight;
    return acc;
  }, {});

  return {
    ...config,
    weights: normalizedWeights as T['weights'],
  };
};

const getDefaultScoringConfig = (type: string): ScoringConfig => {
  const baseConfig = DEFAULT_SCORING_CONFIGS[type] || DEFAULT_SCORING_CONFIGS.GENERAL_STAFF;
  return ensureWeightsSumToOne(JSON.parse(JSON.stringify(baseConfig)));
};

const formatTemplateTypeLabel = (type: string) => {
  if (!type) return 'Unknown';
  return type
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getTemplateTypeLabel = (type: string) => {
  return TEMPLATE_TYPE_OPTIONS.find((option) => option.value === type)?.label || formatTemplateTypeLabel(type);
};

const parseConfigJson = (config?: any) => {
  if (!config) return null;

  if (typeof config === 'string') {
    try {
      return JSON.parse(config);
    } catch (error) {
      console.error('Failed to parse configJson string', error);
      return null;
    }
  }

  return config;
};

const extractErrorMessage = (error: any) => {
  if (error?.response?.data?.message) {
    return Array.isArray(error.response.data.message)
      ? error.response.data.message.join(', ')
      : error.response.data.message;
  }

  if (typeof error?.message === 'string') {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

const slugify = (value: string, fallback = 'template') => {
  const base = value?.toString().trim().toLowerCase() || fallback;
  const slug = base
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
};

const buildSectionKey = (title: string | undefined, index: number) => {
  if (!title?.trim()) {
    return `section_${index + 1}`;
  }
  return slugify(title, `section_${index + 1}`);
};

const buildPayloadFromBuilder = (templateDraft: any, existingTemplate?: AppraisalTemplate | null) => {
  // Handle both direct sections and sections from configJson
  const sections = Array.isArray(templateDraft.sections) 
    ? templateDraft.sections 
    : Array.isArray(templateDraft.configJson?.sections)
      ? templateDraft.configJson.sections
      : [];
  const normalizedSections = sections.map((section: any, index: number) => ({
    id: section.id || `section-${index}`,
    title: section.title || `Section ${index + 1}`,
    description: section.description || '',
    weight: Number(section.weight) || 0,
    type: section.type || 'custom',
    questions: Array.isArray(section.questions) ? section.questions : [],
    order: index,
  }));

  const totalWeight = normalizedSections.reduce(
    (sum: number, section: { weight?: number }) => sum + (section.weight || 0),
    0,
  );
  const denominators: Record<string, number> = {};
  const weights: Record<string, number> = {};
  const maxScores: Record<string, number> = {};

  // Ensure we always have valid weights that sum to 1
  if (normalizedSections.length === 0) {
    // If no sections, create a default weight structure
    weights['default'] = 1;
    denominators['default'] = 100;
    maxScores['default'] = 100;
  } else {
    normalizedSections.forEach((section: { title?: string; weight?: number }, index: number) => {
      const key = buildSectionKey(section.title, index);
      // Calculate normalized weight: if totalWeight > 0, use proportional; otherwise distribute equally
      let normalizedWeight: number;
      if (totalWeight > 0 && (section.weight || 0) > 0) {
        normalizedWeight = (section.weight || 0) / totalWeight;
      } else {
        // If all weights are 0 or totalWeight is 0, distribute equally
        normalizedWeight = 1 / normalizedSections.length;
      }

      weights[key] = Number(normalizedWeight.toFixed(4));
      denominators[key] = 100;
      maxScores[key] = 100;
    });
    
    // Ensure weights sum to exactly 1 (fix any floating point issues)
    const currentSum = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (Object.keys(weights).length > 0) {
      // Normalize to ensure sum is exactly 1
      if (Math.abs(currentSum - 1) > 0.0001) {
        // If sum is not 1, adjust the first weight to make it sum to 1
        const weightKeys = Object.keys(weights);
        if (weightKeys.length > 0) {
          const firstKey = weightKeys[0];
          const otherWeightsSum = weightKeys.slice(1).reduce((sum, k) => sum + weights[k], 0);
          weights[firstKey] = Math.max(0, Number((1 - otherWeightsSum).toFixed(4)));
        }
      }
      
      // Final check and normalization if needed
      const finalSum = Object.values(weights).reduce((sum, w) => sum + w, 0);
      if (Math.abs(finalSum - 1) > 0.0001 && Object.keys(weights).length > 0) {
        // Normalize all weights proportionally to ensure they sum to 1
        const normalizationFactor = 1 / finalSum;
        Object.keys(weights).forEach(key => {
          weights[key] = Number((weights[key] * normalizationFactor).toFixed(4));
        });
        // Set the last weight to exactly 1 minus the sum of others to ensure perfect sum
        const weightKeys = Object.keys(weights);
        if (weightKeys.length > 1) {
          const lastKey = weightKeys[weightKeys.length - 1];
          const othersSum = weightKeys.slice(0, -1).reduce((sum, k) => sum + weights[k], 0);
          weights[lastKey] = Number((1 - othersSum).toFixed(4));
        }
      }
    }
  }

  const typeValue = TEMPLATE_TYPE_OPTIONS.some((option) => option.value === templateDraft.type)
    ? templateDraft.type
    : 'GENERAL_STAFF';

  const existingConfig = existingTemplate ? parseConfigJson(existingTemplate.configJson) : null;
  const existingMetadata = (existingConfig?.metadata as Record<string, any>) || {};
  const trimValue = (value: any) => (typeof value === 'string' ? value.trim() : undefined);

  const metadataDescription =
    trimValue(templateDraft.description) ?? trimValue(existingMetadata.description) ?? '';
  const metadataVersion =
    trimValue(templateDraft.version) ?? trimValue(existingMetadata.version) ?? existingTemplate?.version ?? '1.0';
  const displayNameValue =
    trimValue(templateDraft.displayName) ??
    trimValue(existingMetadata.displayName) ??
    trimValue(existingTemplate?.displayName) ??
    trimValue(templateDraft.name) ??
    'Untitled Template';

  const metadata = {
    ...existingMetadata,
    description: metadataDescription,
    version: metadataVersion,
    displayName: displayNameValue,
  };

  const baseConfig =
    normalizedSections.length > 0
      ? {
          denominators,
          weights,
          maxScores,
          metadata,
          sections: normalizedSections,
        }
      : {
          ...getDefaultScoringConfig(typeValue),
          metadata,
          sections: normalizedSections,
        };

  const normalizedScoring = ensureWeightsSumToOne({
    denominators: baseConfig.denominators,
    weights: baseConfig.weights,
    maxScores: baseConfig.maxScores,
  } as ScoringConfig);

  const normalizedConfig = {
    ...baseConfig,
    denominators: normalizedScoring.denominators,
    weights: normalizedScoring.weights,
    maxScores: normalizedScoring.maxScores,
  };

  const trimmedName = trimValue(templateDraft.name);
  const name = existingTemplate?.id
    ? trimmedName || existingTemplate.name
    : slugify(trimmedName || displayNameValue, 'appraisal-template');

  const version = metadata.version || '1.0';
  const description = metadata.description || '';

  return {
    name,
    displayName: displayNameValue,
    type: typeValue,
    version,
    description,
    configJson: normalizedConfig,
    templateStructure: {
      sections: normalizedSections,
    },
    weighting: normalizedConfig.weights,
    published: existingTemplate?.published ?? templateDraft.published ?? false,
    active: existingTemplate?.active ?? templateDraft.active ?? true,
  };
};

export function AppraisalTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AppraisalTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isBuilderDialogOpen, setIsBuilderDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AppraisalTemplate | null>(null);
  const [builderTemplate, setBuilderTemplate] = useState<AppraisalTemplate | null>(null);

  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await templatesApi.getAll();
      return response.data?.data || [];
    },
  });

  const availableTypeOptions = useMemo(() => {
    const typeMap = new Map<string, string>();
    TEMPLATE_TYPE_OPTIONS.forEach((option) => typeMap.set(option.value, option.label));

    (templates || []).forEach((template: any) => {
      if (template?.type && !typeMap.has(template.type)) {
        typeMap.set(template.type, formatTemplateTypeLabel(template.type));
      }
    });

    return Array.from(typeMap.entries()).map(([value, label]) => ({ value, label }));
  }, [templates]);

  useEffect(() => {
    if (filterType !== 'all' && !availableTypeOptions.some((option) => option.value === filterType)) {
      setFilterType('all');
    }
  }, [filterType, availableTypeOptions]);

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => {
      addToast({
        title: 'Template deleted',
        description: 'The template has been removed successfully.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (mutationError) => {
      addToast({
        title: 'Failed to delete template',
        description: extractErrorMessage(mutationError),
        type: 'error',
      });
    },
  });

  const builderCreateMutation = useMutation({
    mutationFn: (data: any) => templatesApi.create(data),
    onSuccess: (_response, variables) => {
      addToast({
        title: 'Template saved',
        description: `${variables.displayName || variables.name} has been saved successfully.`,
        type: 'success',
      });
      setBuilderTemplate(null);
      setIsBuilderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (mutationError) => {
      addToast({
        title: 'Failed to save template',
        description: extractErrorMessage(mutationError),
        type: 'error',
      });
    },
  });

  const builderUpdateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      console.log('Updating template with payload:', JSON.stringify(data, null, 2));
      // Validate payload structure before sending
      if (data.configJson) {
        const configJson = data.configJson;
        if (configJson.weights) {
          const weightsSum = Object.values(configJson.weights).reduce((sum: number, w: any) => sum + (typeof w === 'number' ? w : 0), 0);
          console.log('Weights sum:', weightsSum, 'Weights:', configJson.weights);
        }
        if (configJson.sections) {
          console.log('Sections count:', configJson.sections.length);
        }
      }
      return templatesApi.update(id, data);
    },
    onSuccess: (_response, variables) => {
      addToast({
        title: 'Template updated',
        description: `${variables.data.displayName || variables.data.name} has been updated successfully.`,
        type: 'success',
      });
      setBuilderTemplate(null);
      setIsBuilderDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (mutationError: any) => {
      console.error('Template update error:', mutationError);
      console.error('Error details:', {
        message: mutationError?.message,
        response: (mutationError as any)?.response?.data,
        status: (mutationError as any)?.response?.status,
      });
      const errorMessage = extractErrorMessage(mutationError);
      addToast({
        title: 'Failed to update template',
        description: errorMessage || 'An unexpected error occurred. Please check the console for details.',
        type: 'error',
        duration: 7000,
      });
    },
  });


  // Filter templates
  const filteredTemplates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (templates || []).filter((template: any) => {
      const nameMatches = template.name?.toLowerCase().includes(term);
      const displayMatches = template.displayName?.toLowerCase().includes(term);
      const descriptionMatches = template.description?.toLowerCase().includes(term);
      const matchesSearch = term.length === 0 || nameMatches || displayMatches || descriptionMatches;

      const matchesType = filterType === 'all' || template.type === filterType;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && template.active) ||
        (filterStatus === 'inactive' && !template.active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [templates, searchTerm, filterType, filterStatus]);

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };


  const handlePreviewTemplate = (template: AppraisalTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleDuplicateTemplate = async (template: AppraisalTemplate) => {
    try {
      const config = parseConfigJson(template.configJson) || getDefaultScoringConfig(template.type);
      const payload = {
        name: `${slugify(template.name || template.displayName || 'template')}-copy`,
        displayName: `${template.displayName || template.name} (Copy)`,
        type: template.type,
        version: template.version || '1.0',
        configJson: ensureWeightsSumToOne(config as ScoringConfig),
        published: false,
        active: true,
      };

      await templatesApi.create(payload);
      addToast({
        title: 'Template duplicated',
        description: `${template.displayName || template.name} has been duplicated successfully.`,
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (duplicationError) {
      addToast({
        title: 'Failed to duplicate template',
        description: extractErrorMessage(duplicationError),
        type: 'error',
      });
    }
  };

  const handleEditTemplate = (template: AppraisalTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleOpenBuilderForEdit = (template: AppraisalTemplate) => {
    setEditingTemplate(template);
    setBuilderTemplate(template);
    setIsEditDialogOpen(false);
    setIsBuilderDialogOpen(true);
  };

  const handleBuilderSave = (templateDraft: any) => {
    const payload = buildPayloadFromBuilder(templateDraft, builderTemplate);

    if (builderTemplate?.id) {
      builderUpdateMutation.mutate({ id: builderTemplate.id, data: payload });
    } else {
      builderCreateMutation.mutate(payload);
    }
  };

  const handleBuilderCancel = () => {
    const wasEditingExisting = Boolean(builderTemplate?.id);
    setIsBuilderDialogOpen(false);
    setBuilderTemplate(null);
    if (wasEditingExisting) {
      setIsEditDialogOpen(true);
    }
  };

  const handlePublishTemplate = async (template: AppraisalTemplate) => {
    try {
      await templatesApi.update(template.id, { published: !template.published });
      addToast({
        title: template.published ? 'Template unpublished' : 'Template published',
        description: `${template.displayName || template.name} is now ${template.published ? 'unpublished' : 'published'}.`,
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      addToast({
        title: 'Failed to update publish status',
        description: extractErrorMessage(error),
        type: 'error',
      });
    }
  };

  const handleArchiveTemplate = async (template: AppraisalTemplate) => {
    try {
      await templatesApi.update(template.id, { active: false });
      addToast({
        title: 'Template archived',
        description: `${template.displayName || template.name} has been archived.`,
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      addToast({
        title: 'Failed to archive template',
        description: extractErrorMessage(error),
        type: 'error',
      });
    }
  };

  const handleViewAnalytics = (template: AppraisalTemplate) => {
    setSelectedTemplate(template);
    setIsAnalyticsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Templates</h2>
            <p className="text-gray-600">Failed to load appraisal templates. Please try again.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8 sticky top-0 bg-gray-50 z-30 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appraisal Templates</h1>
                <p className="mt-2 text-gray-600">Manage and configure performance appraisal templates</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white border-2 border-gray-300 shadow-2xl">
                    <DialogHeader className="bg-gray-50 px-4 py-3 rounded-t-lg border-b">
                      <DialogTitle className="text-xl font-bold text-gray-900">Create New Template</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Create a new appraisal template for your organization
                      </DialogDescription>
                    </DialogHeader>
                    <TemplateForm 
                      typeOptions={availableTypeOptions}
                      onSuccess={() => {
                        setIsCreateDialogOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['templates'] });
                      }}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isBuilderDialogOpen}
                  onOpenChange={(open) => {
                    if (!open) {
                      const wasEditingExisting = Boolean(builderTemplate?.id);
                      setIsBuilderDialogOpen(open);
                      setBuilderTemplate(null);
                      if (wasEditingExisting) {
                        setIsEditDialogOpen(true);
                      }
                    } else {
                      setIsBuilderDialogOpen(open);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBuilderTemplate(null);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Template Builder
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-2xl">
                    <DialogHeader className="bg-gray-50 px-4 py-3 rounded-t-lg border-b">
                      <DialogTitle className="text-xl font-bold text-gray-900">
                        {builderTemplate ? 'Edit Template Structure' : 'Advanced Template Builder'}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600">
                        {builderTemplate
                          ? 'Update sections and questions for this appraisal template.'
                          : 'Create complex appraisal templates with custom sections and questions'}
                      </DialogDescription>
                    </DialogHeader>
                    <TemplateBuilder
                      template={builderTemplate || undefined}
                      onSave={handleBuilderSave}
                      onCancel={handleBuilderCancel}
                      isSaving={builderCreateMutation.isPending || builderUpdateMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Import/Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white border-2 border-gray-300 shadow-2xl">
                    <DialogHeader className="bg-gray-50 px-4 py-3 rounded-t-lg border-b">
                      <DialogTitle className="text-xl font-bold text-gray-900">Template Management</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Import, export, and backup your appraisal templates
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <TemplateImportExport
                        onImport={(templates) => {
                          console.log('Importing templates:', templates);
                          queryClient.invalidateQueries({ queryKey: ['templates'] });
                        }}
                        templates={templates || []}
                      />
                      <TemplateBackup />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <div className="text-2xl font-bold text-blue-600">{(templates || []).length}</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">All appraisal templates</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <div className="text-2xl font-bold text-green-600">
                  {(templates || []).filter((t: any) => t.active).length}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Currently in use</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <div className="text-2xl font-bold text-purple-600">
                  {(templates || []).filter((t: any) => t.published).length}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Available for use</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set((templates || []).map((t: any) => t.type)).size}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Template types</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search templates by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {availableTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: any) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.displayName || template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {getTemplateTypeLabel(template.type)} • Version {template.version || '1.0'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={template.active ? "default" : "secondary"}>
                        {template.active ? "Active" : "Inactive"}
                      </Badge>
                      {template.published && (
                        <Badge variant="outline">Published</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Created: {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}</p>
                      <p>Updated: {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicate
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishTemplate(template)}
                        className={template.published ? "bg-green-100 text-green-700" : ""}
                      >
                        {template.published ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                        {template.published ? "Unpublish" : "Publish"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalytics(template)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiveTemplate(template)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Archive className="w-4 h-4 mr-1" />
                        Archive
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first appraisal template'
                  }
                </p>
                {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>

        {/* Template Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-2xl">
            <DialogHeader className="bg-gray-50 px-4 py-3 rounded-t-lg border-b">
              <DialogTitle className="text-xl font-bold text-gray-900">Template Preview</DialogTitle>
              <DialogDescription className="text-gray-600">
                {selectedTemplate?.displayName || selectedTemplate?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              {selectedTemplate && (
                <TemplatePreview template={selectedTemplate} />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-white border-2 border-gray-300 shadow-2xl">
            <DialogHeader className="bg-gray-50 px-4 py-3 rounded-t-lg border-b">
              <DialogTitle className="text-xl font-bold text-gray-900">Edit Template</DialogTitle>
              <DialogDescription className="text-gray-600">
                Update template details and configuration
              </DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <TemplateForm 
                template={editingTemplate}
                typeOptions={availableTypeOptions}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setEditingTemplate(null);
                  queryClient.invalidateQueries({ queryKey: ['templates'] });
                }}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingTemplate(null);
                }}
                onEditStructure={() => {
                  if (editingTemplate) {
                    handleOpenBuilderForEdit(editingTemplate);
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Template Analytics Dialog */}
        <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-2xl">
            <DialogHeader className="bg-gray-50 px-4 py-3 rounded-t-lg border-b">
              <DialogTitle className="text-xl font-bold text-gray-900">Template Analytics</DialogTitle>
              <DialogDescription className="text-gray-600">
                Detailed usage and performance analytics for {selectedTemplate?.displayName || selectedTemplate?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <TemplateAnalytics template={selectedTemplate} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Template Form Component
function TemplateForm({
  template,
  onSuccess,
  onCancel,
  onEditStructure,
  typeOptions,
}: {
  template?: AppraisalTemplate;
  onSuccess: () => void;
  onCancel: () => void;
  onEditStructure?: () => void;
  typeOptions?: { value: string; label: string }[];
}) {
  const { addToast } = useToast();
  const parsedConfig = useMemo(() => parseConfigJson(template?.configJson), [template?.configJson]);

  const effectiveTypeOptions = useMemo(() => {
    const options = typeOptions && typeOptions.length > 0 ? [...typeOptions] : [...TEMPLATE_TYPE_OPTIONS];
    if (template?.type && !options.some((option) => option.value === template.type)) {
      options.push({
        value: template.type,
        label: formatTemplateTypeLabel(template.type),
      });
    }
    return options;
  }, [typeOptions, template?.type]);

  const resolvedType = useMemo(() => {
    if (template?.type && effectiveTypeOptions.some((option) => option.value === template.type)) {
      return template.type;
    }
    return 'GENERAL_STAFF';
  }, [template?.type, effectiveTypeOptions]);

  const initialFormState = useMemo(
    () => ({
      name: template?.name || '',
      displayName: template?.displayName || '',
      type: resolvedType,
      version: template?.version || '1.0',
      description:
        parsedConfig?.metadata?.description ||
        template?.description ||
        '',
    }),
    [template?.name, template?.displayName, template?.version, template?.description, resolvedType, parsedConfig?.metadata?.description],
  );

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setFormData(initialFormState);
  }, [initialFormState]);

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => templatesApi.create(data),
    onSuccess: () => {
      addToast({
        title: 'Template created',
        description: `${formData.displayName || formData.name} has been created successfully.`,
        type: 'success',
      });
      onSuccess();
    },
    onError: (error) => {
      addToast({
        title: 'Failed to create template',
        description: extractErrorMessage(error),
        type: 'error',
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: (data: any) => templatesApi.update(template!.id, data),
    onSuccess: () => {
      addToast({
        title: 'Template updated',
        description: `${formData.displayName || formData.name} has been updated successfully.`,
        type: 'success',
      });
      onSuccess();
    },
    onError: (error) => {
      addToast({
        title: 'Failed to update template',
        description: extractErrorMessage(error),
        type: 'error',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.displayName.trim()) {
      addToast({
        title: 'Missing details',
        description: 'Please provide both a template name and display name.',
        type: 'error',
      });
      return;
    }

    const baseConfig = parsedConfig && parsedConfig.denominators && parsedConfig.weights && parsedConfig.maxScores
      ? parsedConfig
      : getDefaultScoringConfig(formData.type);

    const configClone = JSON.parse(JSON.stringify(baseConfig));
    const configWithMetadata = {
      ...configClone,
      metadata: {
        ...(configClone.metadata || {}),
        description: formData.description,
        version: formData.version,
        displayName: formData.displayName,
      },
    };

    const payload = {
      name: formData.name.trim(),
      displayName: formData.displayName.trim(),
      type: formData.type,
      version: formData.version,
      configJson: ensureWeightsSumToOne(configWithMetadata as ScoringConfig),
      published: template?.published || false,
      active: template?.active !== false,
    };

    if (template) {
      updateTemplateMutation.mutate(payload);
    } else {
      createTemplateMutation.mutate(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., faculty-appraisal-v1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
          <Input
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="e.g., Faculty Performance Appraisal"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {effectiveTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
          <Input
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="1.0"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          rows={3}
          placeholder="Describe this template's purpose and usage..."
        />
      </div>
      
      {template && onEditStructure && (
        <div className="pt-2 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onEditStructure}>
            Edit Template Structure
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
          {createTemplateMutation.isPending || updateTemplateMutation.isPending 
            ? (template ? 'Updating...' : 'Creating...') 
            : (template ? 'Update Template' : 'Create Template')
          }
        </Button>
      </div>
    </form>
  );
}

// Template Preview Component
function TemplatePreview({ template }: { template: AppraisalTemplate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900">Template Details</h4>
          <div className="mt-2 space-y-2 text-sm text-gray-600">
            <p><strong>Name:</strong> {template.name}</p>
            <p><strong>Display Name:</strong> {template.displayName}</p>
            <p><strong>Type:</strong> {template.type}</p>
            <p><strong>Version:</strong> {template.version}</p>
            <p><strong>Status:</strong> {template.active ? 'Active' : 'Inactive'}</p>
            <p><strong>Published:</strong> {template.published ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900">Timestamps</h4>
          <div className="mt-2 space-y-2 text-sm text-gray-600">
            <p><strong>Created:</strong> {template.createdAt ? new Date(template.createdAt).toLocaleString() : 'N/A'}</p>
            <p><strong>Updated:</strong> {template.updatedAt ? new Date(template.updatedAt).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Template Configuration</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-600 whitespace-pre-wrap">
            {JSON.stringify(template.sections || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
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

  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await templatesApi.getAll();
      return response.data?.data || [];
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });


  // Filter templates
  const filteredTemplates = (templates || []).filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && template.active) ||
                         (filterStatus === 'inactive' && !template.active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      await templatesApi.create({
        name: `${template.name}-copy`,
        displayName: `${template.displayName} (Copy)`,
        type: template.type,
        version: '1.0',
        configJson: template.configJson || {},
        published: false,
        active: true
      });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleEditTemplate = (template: AppraisalTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handlePublishTemplate = async (template: AppraisalTemplate) => {
    try {
      await templatesApi.update(template.id, { published: !template.published });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      console.error('Error publishing template:', error);
    }
  };

  const handleArchiveTemplate = async (template: AppraisalTemplate) => {
    try {
      await templatesApi.update(template.id, { active: false });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      console.error('Error archiving template:', error);
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
                      onSuccess={() => {
                        setIsCreateDialogOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['templates'] });
                      }}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isBuilderDialogOpen} onOpenChange={setIsBuilderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Template Builder
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-2xl">
                    <DialogHeader className="bg-gray-50 px-4 py-3 rounded-t-lg border-b">
                      <DialogTitle className="text-xl font-bold text-gray-900">Advanced Template Builder</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Create complex appraisal templates with custom sections and questions
                      </DialogDescription>
                    </DialogHeader>
                    <TemplateBuilder
                      onSave={(template) => {
                        // Handle template save
                        console.log('Saving template:', template);
                        setIsBuilderDialogOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['templates'] });
                      }}
                      onCancel={() => setIsBuilderDialogOpen(false)}
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
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="DEAN">Dean</SelectItem>
                      <SelectItem value="CLINICAL_INSTRUCTOR">Clinical Instructor</SelectItem>
                      <SelectItem value="EXECUTIVE_MANAGEMENT">Executive Management</SelectItem>
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
                        {template.type} • Version {template.version}
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
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setEditingTemplate(null);
                  queryClient.invalidateQueries({ queryKey: ['templates'] });
                }}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingTemplate(null);
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
  onCancel 
}: { 
  template?: AppraisalTemplate; 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    displayName: template?.displayName || '',
    type: template?.type || 'FACULTY',
    version: template?.version || '1.0',
    description: template?.description || '',
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => templatesApi.create(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: (data: any) => templatesApi.update(template!.id, data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const templateData = {
      ...formData,
      configJson: template?.configJson || {},
      published: template?.published || false,
      active: template?.active !== false,
    };

    if (template) {
      updateTemplateMutation.mutate(templateData);
    } else {
      createTemplateMutation.mutate(templateData);
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

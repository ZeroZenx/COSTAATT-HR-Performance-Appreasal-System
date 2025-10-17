import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { X, Save, AlertCircle } from 'lucide-react';

interface Competency {
  id?: string;
  code: string;
  name: string;
  description: string;
  definition: string;
  basicBehaviours: string;
  aboveExpectationsBehaviours: string;
  outstandingBehaviours: string;
  department: string;
  jobLevel: string;
  category: string;
  clusterId: string;
  cluster?: {
    id: string;
    name: string;
  };
}

interface CompetencyCluster {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface CompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  competency?: Competency | null;
  clusters: CompetencyCluster[];
  onSave: (competency: Competency) => void;
  isLoading?: boolean;
  mode?: 'view' | 'edit' | 'create';
}

export function CompetencyModal({ 
  isOpen, 
  onClose, 
  competency, 
  clusters, 
  onSave, 
  isLoading = false,
  mode = 'create'
}: CompetencyModalProps) {
  const [formData, setFormData] = useState<Competency>({
    code: competency?.code || '',
    name: competency?.name || '',
    description: competency?.description || '',
    definition: competency?.definition || '',
    basicBehaviours: competency?.basicBehaviours || '',
    aboveExpectationsBehaviours: competency?.aboveExpectationsBehaviours || '',
    outstandingBehaviours: competency?.outstandingBehaviours || '',
    department: competency?.department || '',
    jobLevel: competency?.jobLevel || '',
    category: competency?.category || '',
    clusterId: competency?.clusterId || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.clusterId) {
      newErrors.clusterId = 'Cluster is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const competencyData = {
      ...formData,
      id: competency?.id
    };

    onSave(competencyData);
  };

  const handleInputChange = (field: keyof Competency, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-2xl">
        <DialogHeader className="bg-gray-50 p-6 border-b border-gray-200">
          <DialogTitle className="flex items-center justify-between text-xl font-bold text-gray-900">
            {isViewMode ? 'View Competency' : competency ? 'Edit Competency' : 'Add New Competency'}
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-200">
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {isViewMode 
              ? 'View the competency details below.' 
              : competency 
                ? 'Update the competency details below.' 
                : 'Fill in the details to create a new competency.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="e.g., COMM_001"
                  className={`${errors.code ? 'border-red-500' : ''} ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  readOnly={isViewMode}
                />
                {errors.code && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.code}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Communication Skills"
                  className={`${errors.name ? 'border-red-500' : ''} ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  readOnly={isViewMode}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="clusterId">Cluster *</Label>
                <Select 
                  value={formData.clusterId} 
                  onValueChange={(value) => handleInputChange('clusterId', value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger className={`${errors.clusterId ? 'border-red-500' : ''} ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}>
                    <SelectValue placeholder="Select a cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusters.map((cluster) => (
                      <SelectItem key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clusterId && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.clusterId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Personal Effectiveness"
                  className={isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}
                  readOnly={isViewMode}
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g., Human Resources"
                />
              </div>

              <div>
                <Label htmlFor="jobLevel">Job Level</Label>
                <Select value={formData.jobLevel} onValueChange={(value) => handleInputChange('jobLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description and Definition */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the competency"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="definition">Definition</Label>
                <Textarea
                  id="definition"
                  value={formData.definition}
                  onChange={(e) => handleInputChange('definition', e.target.value)}
                  placeholder="Detailed definition of the competency"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Behavioral Indicators */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Behavioral Indicators</h3>
            
            <div>
              <Label htmlFor="basicBehaviours">Basic Behaviours</Label>
              <Textarea
                id="basicBehaviours"
                value={formData.basicBehaviours}
                onChange={(e) => handleInputChange('basicBehaviours', e.target.value)}
                placeholder="Describe basic level behaviors (separate with semicolons)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="aboveExpectationsBehaviours">Above Expectations Behaviours</Label>
              <Textarea
                id="aboveExpectationsBehaviours"
                value={formData.aboveExpectationsBehaviours}
                onChange={(e) => handleInputChange('aboveExpectationsBehaviours', e.target.value)}
                placeholder="Describe above expectations behaviors (separate with semicolons)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="outstandingBehaviours">Outstanding Behaviours</Label>
              <Textarea
                id="outstandingBehaviours"
                value={formData.outstandingBehaviours}
                onChange={(e) => handleInputChange('outstandingBehaviours', e.target.value)}
                placeholder="Describe outstanding behaviors (separate with semicolons)"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {competency ? 'Update' : 'Create'} Competency
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

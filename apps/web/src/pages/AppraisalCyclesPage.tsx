import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { 
  Plus,
  Edit,
  Play,
  Square,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { settingsApi } from '../lib/api';
import { format, parseISO } from 'date-fns';

export function AppraisalCyclesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);

  // Fetch cycles
  const { data: cycles, isLoading } = useQuery({
    queryKey: ['settings', 'cycles'],
    queryFn: () => settingsApi.getCycles().then(res => res.data),
  });

  // Create cycle mutation
  const createCycleMutation = useMutation({
    mutationFn: (data: any) => settingsApi.createCycle(data),
    onSuccess: () => {
      toast.success('Appraisal cycle created successfully!');
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries(['settings', 'cycles']);
    },
    onError: (err: any) => {
      toast.error(`Failed to create cycle: ${err.response?.data?.message || err.message}`);
    },
  });

  // Update cycle mutation
  const updateCycleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => settingsApi.updateCycle(id, data),
    onSuccess: () => {
      toast.success('Appraisal cycle updated successfully!');
      setIsEditDialogOpen(false);
      setSelectedCycle(null);
      queryClient.invalidateQueries(['settings', 'cycles']);
    },
    onError: (err: any) => {
      toast.error(`Failed to update cycle: ${err.response?.data?.message || err.message}`);
    },
  });

  // Activate cycle mutation
  const activateCycleMutation = useMutation({
    mutationFn: (id: string) => settingsApi.activateCycle(id),
    onSuccess: () => {
      toast.success('Appraisal cycle activated successfully!');
      queryClient.invalidateQueries(['settings', 'cycles']);
    },
    onError: (err: any) => {
      toast.error(`Failed to activate cycle: ${err.response?.data?.message || err.message}`);
    },
  });

  // Close cycle mutation
  const closeCycleMutation = useMutation({
    mutationFn: (id: string) => settingsApi.closeCycle(id),
    onSuccess: () => {
      toast.success('Appraisal cycle closed successfully!');
      queryClient.invalidateQueries(['settings', 'cycles']);
    },
    onError: (err: any) => {
      toast.error(`Failed to close cycle: ${err.response?.data?.message || err.message}`);
    },
  });

  const handleCreateCycle = (data: any) => {
    createCycleMutation.mutate(data);
  };

  const handleUpdateCycle = (data: any) => {
    if (selectedCycle) {
      updateCycleMutation.mutate({ id: selectedCycle.id, data });
    }
  };

  const handleActivateCycle = (cycle: any) => {
    if (window.confirm(`Are you sure you want to activate "${cycle.name}"? This will deactivate any currently active cycle.`)) {
      activateCycleMutation.mutate(cycle.id);
    }
  };

  const handleCloseCycle = (cycle: any) => {
    if (window.confirm(`Are you sure you want to close "${cycle.name}"? This will prevent new appraisals from being created in this cycle.`)) {
      closeCycleMutation.mutate(cycle.id);
    }
  };

  const handleEditCycle = (cycle: any) => {
    setSelectedCycle(cycle);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Appraisal Cycles</h1>
            <p className="text-gray-600">Manage performance review cycles and periods</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Cycle
              </Button>
            </DialogTrigger>
            <CreateCycleDialog 
              onSubmit={handleCreateCycle}
              isOpen={isCreateDialogOpen}
              onClose={() => setIsCreateDialogOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Cycles List */}
      <div className="space-y-6">
        {cycles?.map((cycle: any) => (
          <Card key={cycle.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">{cycle.name}</CardTitle>
                  {cycle.isActive && (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                  {!cycle.isActive && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Square className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!cycle.isActive && (
                    <Button
                      size="sm"
                      onClick={() => handleActivateCycle(cycle)}
                      disabled={activateCycleMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                  )}
                  {cycle.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCloseCycle(cycle)}
                      disabled={closeCycleMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCycle(cycle)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{cycle.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Period Start</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(cycle.periodStart), 'PPP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Period End</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(cycle.periodEnd), 'PPP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(cycle.createdAt), 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {cycles?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appraisal Cycles</h3>
              <p className="text-gray-600 mb-4">
                Create your first appraisal cycle to start managing performance reviews.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Cycle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appraisal Cycle</DialogTitle>
            <DialogDescription>
              Update the details of the appraisal cycle.
            </DialogDescription>
          </DialogHeader>
          <EditCycleDialog 
            cycle={selectedCycle}
            onSubmit={handleUpdateCycle}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedCycle(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Cycle Dialog Component
function CreateCycleDialog({ onSubmit, isOpen, onClose }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    periodStart: '',
    periodEnd: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', description: '', periodStart: '', periodEnd: '' });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Appraisal Cycle</DialogTitle>
        <DialogDescription>
          Set up a new performance review cycle with start and end dates.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Cycle Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 2024 Annual Performance Review"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this appraisal cycle..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="periodStart">Period Start</Label>
            <Input
              id="periodStart"
              type="date"
              value={formData.periodStart}
              onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="periodEnd">Period End</Label>
            <Input
              id="periodEnd"
              type="date"
              value={formData.periodEnd}
              onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Cycle
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// Edit Cycle Dialog Component
function EditCycleDialog({ cycle, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    name: cycle?.name || '',
    description: cycle?.description || '',
    periodStart: cycle?.periodStart ? format(parseISO(cycle.periodStart), 'yyyy-MM-dd') : '',
    periodEnd: cycle?.periodEnd ? format(parseISO(cycle.periodEnd), 'yyyy-MM-dd') : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Cycle Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., 2024 Annual Performance Review"
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this appraisal cycle..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-periodStart">Period Start</Label>
          <Input
            id="edit-periodStart"
            type="date"
            value={formData.periodStart}
            onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-periodEnd">Period End</Label>
          <Input
            id="edit-periodEnd"
            type="date"
            value={formData.periodEnd}
            onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Update Cycle
        </Button>
      </DialogFooter>
    </form>
  );
}


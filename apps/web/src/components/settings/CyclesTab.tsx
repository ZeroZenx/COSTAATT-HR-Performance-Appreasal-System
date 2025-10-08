import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Edit, Trash2, Copy, Archive } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';

interface Cycle {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  description?: string;
  _count: {
    appraisalInstances: number;
  };
}

export function CyclesTab() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const queryClient = useQueryClient();

  const { data: cycles, isLoading } = useQuery({
    queryKey: ['settings', 'cycles'],
    queryFn: () => settingsApi.getCycles().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: settingsApi.createCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'cycles'] });
      setIsCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => settingsApi.updateCycle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'cycles'] });
      setIsEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'cycles'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: settingsApi.duplicateCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'cycles'] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: settingsApi.closeCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'cycles'] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      PLANNED: 'secondary',
      ACTIVE: 'default',
      CLOSED: 'destructive',
      ARCHIVED: 'outline',
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEdit = (cycle: Cycle) => {
    setSelectedCycle(cycle);
    setIsEditOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (selectedCycle) {
      updateMutation.mutate({ id: selectedCycle.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this cycle?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  const handleClose = (id: string) => {
    if (confirm('Are you sure you want to close this cycle?')) {
      closeMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Appraisal Cycles</h3>
          <p className="text-sm text-gray-600">Manage review periods and deadlines</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Cycle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Cycle</DialogTitle>
              <DialogDescription>
                Create a new appraisal cycle with start and end dates.
              </DialogDescription>
            </DialogHeader>
            <CycleForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cycles</CardTitle>
          <CardDescription>
            View and manage all appraisal cycles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Appraisals</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles?.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">{cycle.name}</TableCell>
                  <TableCell>
                    {new Date(cycle.periodStart).toLocaleDateString()} - {new Date(cycle.periodEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                  <TableCell>{cycle._count.appraisalInstances}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cycle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(cycle.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {cycle.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClose(cycle.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cycle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cycle</DialogTitle>
            <DialogDescription>
              Update the cycle details and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedCycle && (
            <CycleForm
              initialData={selectedCycle}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CycleForm({ initialData, onSubmit }: { initialData?: Cycle; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    startDate: initialData?.periodStart ? new Date(initialData.periodStart).toISOString().split('T')[0] : '',
    endDate: initialData?.periodEnd ? new Date(initialData.periodEnd).toISOString().split('T')[0] : '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Cycle Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit">Save Cycle</Button>
      </div>
    </form>
  );
}

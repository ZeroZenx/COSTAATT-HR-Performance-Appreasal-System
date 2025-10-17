import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { appraisalsApi } from '../lib/api';

interface Competency {
  id: string;
  name: string;
  description?: string;
  code: string;
  cluster?: {
    id: string;
    name: string;
    category: string;
  };
}

interface CompetencySelectorProps {
  appraisalId: string;
  onSave: () => void;
}

export function CompetencySelector({ appraisalId, onSave }: CompetencySelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  // Fetch competencies
  const { data: competencies = [], isLoading } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/competencies');
      if (!response.ok) {
        throw new Error('Failed to fetch competencies');
      }
      return response.json() as Promise<Competency[]>;
    }
  });

  // Fetch existing appraisal competencies
  const { data: appraisal } = useQuery({
    queryKey: ['appraisal', appraisalId],
    queryFn: async () => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${appraisalId}`);
      if (!response.ok) throw new Error('Failed to fetch appraisal');
      return response.json();
    },
    enabled: !!appraisalId
  });

  // Load existing competencies on mount
  useEffect(() => {
    if (appraisal?.data?.competencies) {
      const existingCompetencyIds = appraisal.data.competencies.map(
        (ac: any) => ac.competency.id
      );
      setSelected(existingCompetencyIds);
    }
  }, [appraisal]);

  // Save competencies mutation
  const saveCompetenciesMutation = useMutation({
    mutationFn: async (competencyIds: string[]) => {
      console.log('Saving competencies:', { appraisalId, competencyIds });
      try {
        const response = await appraisalsApi.assignCompetencies(appraisalId, competencyIds);
        console.log('Save response:', response);
        return response;
      } catch (error) {
        console.error('Detailed error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisal', appraisalId] });
      onSave();
    },
    onError: (error: any) => {
      console.error('Error saving competencies:', error);
      // Only show error if this is actually a competency save operation error
      if (error?.config?.url?.includes('/competencies') || error?.message?.includes('competency')) {
        const errorMessage = error?.response?.data?.error || error?.message || 'Unknown error occurred';
        alert(`Failed to save competencies: ${errorMessage}`);
      } else {
        console.log('Non-competency error caught, not showing alert:', error);
      }
    }
  });

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((c) => c !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    if (selected.length !== 3) {
      alert('Please select exactly 3 competencies.');
      return;
    }
    
    setSaving(true);
    try {
      await saveCompetenciesMutation.mutateAsync(selected);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-6 border p-6 rounded-xl bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Select Manager Competencies</h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose exactly 3 competencies from the library.
      </p>
      
      {/* Selection counter */}
      <div className="mb-4 text-sm text-gray-700">
        <span className={`font-medium ${selected.length === 3 ? 'text-green-600' : 'text-blue-600'}`}>
          {selected.length} of 3 selected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {competencies.map((competency: Competency) => (
          <button
            key={competency.id}
            className={`border rounded-lg px-3 py-2 text-sm text-left transition-colors ${
              selected.includes(competency.id)
                ? "bg-blue-600 text-white border-blue-600"
                : selected.length >= 3
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 border-gray-300 hover:border-blue-300"
            }`}
            onClick={() => toggleSelect(competency.id)}
            disabled={selected.length >= 3 && !selected.includes(competency.id)}
          >
            <div className="font-medium">{competency.name}</div>
            {competency.code && (
              <div className="text-xs opacity-75 mt-1">Code: {competency.code}</div>
            )}
            {competency.cluster && (
              <div className="text-xs opacity-75">Cluster: {competency.cluster.name}</div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          {selected.length === 3 ? (
            <span className="text-green-600 flex items-center">
              ✓ Ready to save - All 3 competencies selected
            </span>
          ) : (
            <span>Select {3 - selected.length} more competency{3 - selected.length !== 1 ? 'ies' : ''}</span>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSave}
            disabled={saving}
          >
            Skip for Now
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSave}
            disabled={saving || selected.length !== 3}
          >
            {saving ? "Saving..." : "Save Competencies"}
          </Button>
        </div>
      </div>
    </div>
  );
}

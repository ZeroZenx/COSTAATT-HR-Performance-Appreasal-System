import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { AppraisalBuilder } from '../components/AppraisalBuilder';
import { appraisalInstancesApi } from '../lib/api';
import { useToast } from '../components/ui/toast';

export function AppraisalEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();

  const { data: appraisal, isLoading, error } = useQuery({
    queryKey: ['appraisal-instance', id],
    queryFn: () => appraisalInstancesApi.getById(id!).then(res => {
      // Handle direct response (not wrapped in data field)
      return res.data.data || res.data;
    }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.error('❌ Error loading appraisal:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Appraisal</h2>
        <p className="text-gray-600">There was an error loading the appraisal: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Appraisal ID: {id}</p>
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appraisal not found</h2>
        <p className="text-gray-600">The requested appraisal could not be found.</p>
        <p className="text-sm text-gray-500 mt-2">Appraisal ID: {id}</p>
      </div>
    );
  }

  const handleSave = (data: any) => {
    // TODO: Implement save functionality
  };

  const handleSubmit = async (data: any) => {
    try {
      
      // First update the sections with the form data
      await appraisalInstancesApi.updateSections(id!, data);
      
      // Then submit for review
      await appraisalInstancesApi.submitForReview(id!);
      
      addToast({
        title: 'Appraisal Submitted Successfully',
        description: 'Submission successful. Confirmation sent to you and HR.',
        type: 'success',
        duration: 5000
      });
      
      // Optionally navigate back to appraisals list
      // navigate('/appraisals');
      
    } catch (error: any) {
      console.error('❌ Error submitting appraisal:', error);
      addToast({
        title: 'Submission Failed',
        description: `Failed to submit appraisal: ${error.response?.data?.message || error.message}`,
        type: 'error',
        duration: 7000
      });
    }
  };

  return (
    <AppraisalBuilder
      templateId={appraisal.template?.id || ''}
      onSave={handleSave}
      onSubmit={handleSubmit}
    />
  );
}


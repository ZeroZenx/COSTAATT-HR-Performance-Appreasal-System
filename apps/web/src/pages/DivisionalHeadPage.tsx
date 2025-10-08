import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface HeadRecommendationData {
  probationConfirm?: boolean;
  probationDoNotConfirm?: boolean;
  contractNegotiate?: boolean;
  contractDoNotRenew?: boolean;
  notes?: string;
  signature: { name: string; signedAt: string };
  // HR Decision Fields
  hrDecision?: string;
  hrComments?: string;
  hrSignature?: string;
}

export default function DivisionalHeadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HeadRecommendationData>({
    signature: { name: '', signedAt: '' }
  });


  // Fetch appraisal data
  const { data: appraisal, isLoading, error } = useQuery({
    queryKey: ['appraisal-finalize', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/appraisals/${id}/finalize`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch appraisal:', response.status, errorText);
        throw new Error(`Failed to fetch appraisal: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      return data;
    },
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: HeadRecommendationData) => {
      const response = await fetch(`http://localhost:3000/appraisals/${id}/finalize/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headRecommendation: data }),
      });
      if (!response.ok) throw new Error('Failed to save draft');
      return response.json();
    },
  });

  // Submit finalization mutation
  const submitFinalizationMutation = useMutation({
    mutationFn: async (data: HeadRecommendationData) => {
      const response = await fetch(`http://localhost:3000/appraisals/${id}/finalize/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          headRecommendation: data, 
          signature: data.signature,
          hrDecision: data.hrDecision,
          hrComments: data.hrComments,
          hrSignature: data.hrSignature
        }),
      });
      if (!response.ok) throw new Error('Failed to submit finalization');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] });
      navigate('/dashboard');
    },
  });

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(formData);
  };

  const handleSubmit = () => {
    if (!formData.signature.name) {
      alert('Please provide your signature');
      return;
    }
    
    if (!formData.hrDecision || !formData.hrSignature) {
      alert('Please provide HR decision and signature');
      return;
    }

    submitFinalizationMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Error Loading Appraisal</h2>
          <p className="text-red-600">{error.message}</p>
          <p className="text-sm text-red-500 mt-2">Appraisal ID: {id}</p>
        </div>
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">No Appraisal Data</h2>
          <p className="text-red-600">Unable to load appraisal data. Please try again.</p>
          <p className="text-sm text-red-500 mt-2">Appraisal ID: {id}</p>
        </div>
      </div>
    );
  }

  // Debug information

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Divisional Head Finalization</h1>
          <p className="text-gray-600">Review and finalize the performance appraisal</p>
        </div>

        {/* Employee Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Employee Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee Name</label>
              <p className="text-sm text-gray-900">
                {appraisal.employee?.user?.firstName} {appraisal.employee?.user?.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{appraisal.employee?.user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <p className="text-sm text-gray-900">{appraisal.template?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cycle</label>
              <p className="text-sm text-gray-900">{appraisal.cycle?.name}</p>
            </div>
          </div>
        </div>

        {/* Manager Review Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Manager Review Summary</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
              <p className="text-sm text-gray-900">{appraisal.managerRating || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Manager Comments</label>
              <p className="text-sm text-gray-900">{appraisal.managerComment || 'No comments provided'}</p>
            </div>
          </div>
        </div>

        {/* Divisional Head Recommendation */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Divisional Head Recommendation</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.probationConfirm || false}
                  onChange={(e) => setFormData({ ...formData, probationConfirm: e.target.checked })}
                />
                Confirm Probation
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.probationDoNotConfirm || false}
                  onChange={(e) => setFormData({ ...formData, probationDoNotConfirm: e.target.checked })}
                />
                Do Not Confirm Probation
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.contractNegotiate || false}
                  onChange={(e) => setFormData({ ...formData, contractNegotiate: e.target.checked })}
                />
                Negotiate Contract
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.contractDoNotRenew || false}
                  onChange={(e) => setFormData({ ...formData, contractDoNotRenew: e.target.checked })}
                />
                Do Not Renew Contract
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes or recommendations..."
              />
            </div>
          </div>
        </div>

        {/* HR Final Decision */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">HR Final Decision</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Decision *
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={formData.hrDecision || ''}
                onChange={(e) => setFormData({ ...formData, hrDecision: e.target.value })}
              >
                <option value="">Select a decision</option>
                <option value="RENEW_CONTRACT">Renew Contract</option>
                <option value="EXTEND_PROBATION">Extend Probation</option>
                <option value="TERMINATE">Terminate Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HR Comments
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
                value={formData.hrComments || ''}
                onChange={(e) => setFormData({ ...formData, hrComments: e.target.value })}
                placeholder="Add HR comments or justification..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HR Signature *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={formData.hrSignature || ''}
                onChange={(e) => setFormData({ ...formData, hrSignature: e.target.value })}
                placeholder="Enter HR representative name"
              />
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Divisional Head Signature</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={formData.signature.name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  signature: { ...formData.signature, name: e.target.value } 
                })}
                placeholder="Enter your full name"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saveDraftMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {saveDraftMutation.isPending ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitFinalizationMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitFinalizationMutation.isPending ? 'Submitting...' : 'Submit Finalization'}
          </button>
        </div>
      </div>
    </div>
  );
}
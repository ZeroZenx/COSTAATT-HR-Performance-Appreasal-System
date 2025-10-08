import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ManagerReviewData {
  sectionComments: Array<{ sectionId: string; comment: string }>;
  overallComment: string;
  overallRating: number;
  contractBlock: {
    probationConfirm?: boolean;
    probationDoNotConfirm?: boolean;
    contractNegotiate?: boolean;
    contractDoNotRenew?: boolean;
    narrative: string;
  };
  signature: { name: string; signedAt: string };
}

export function ManagerReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ManagerReviewData>({
    sectionComments: [],
    overallComment: '',
    overallRating: 0,
    contractBlock: {
      narrative: ''
    },
    signature: { name: '', signedAt: '' }
  });

  // Fetch appraisal data
  const { data: appraisal, isLoading } = useQuery({
    queryKey: ['appraisal-review', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/appraisals/${id}/review`);
      if (!response.ok) throw new Error('Failed to fetch appraisal');
      return response.json();
    },
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: ManagerReviewData) => {
      const response = await fetch(`http://localhost:3000/appraisals/${id}/review/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save draft');
      return response.json();
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: ManagerReviewData) => {
      const response = await fetch(`http://localhost:3000/appraisals/${id}/review/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit review');
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
    if (!formData.overallRating || !formData.overallComment || !formData.signature.name) {
      alert('Please fill in all required fields');
      return;
    }
    submitReviewMutation.mutate(formData);
  };

  // Load existing data when appraisal loads
  useEffect(() => {
    if (appraisal) {
      setFormData({
        sectionComments: appraisal.managerSectionNotes ? 
          Object.entries(appraisal.managerSectionNotes).map(([sectionId, comment]) => ({
            sectionId,
            comment: comment || ''
          })) : [],
        overallComment: appraisal.managerComment || '',
        overallRating: appraisal.managerRating || 0,
        contractBlock: appraisal.contractBlock || { narrative: '' },
        signature: { 
          name: appraisal.managerSignedName || '', 
          signedAt: appraisal.managerSignedAt || '' 
        }
      });
    }
  }, [appraisal]);

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manager Review</h1>
            <p className="text-gray-600">
              {appraisal?.employee?.user?.firstName} {appraisal?.employee?.user?.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {appraisal?.template?.name} • {appraisal?.cycle?.name}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {appraisal?.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Employee Inputs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Self-Assessment</h2>
          <div className="space-y-4">
            {appraisal?.sections && Object.entries(appraisal.sections).map(([sectionKey, sectionData]: [string, any]) => (
              <div key={sectionKey} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 capitalize">{sectionKey.replace('_', ' ')}</h3>
                <div className="mt-2 space-y-2">
                  {Object.entries(sectionData).map(([questionKey, answer]: [string, any]) => (
                    <div key={questionKey}>
                      <p className="text-sm text-gray-600">{questionKey}</p>
                      <p className="text-sm text-gray-900">{answer?.comment || answer?.rating || 'No response'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Manager Review */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Manager Review</h2>
          
          {/* Section Comments */}
          <div className="space-y-4">
            {appraisal?.sections && Object.keys(appraisal.sections).map(sectionKey => (
              <div key={sectionKey}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments for {sectionKey.replace('_', ' ')}
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  value={formData.sectionComments.find(sc => sc.sectionId === sectionKey)?.comment || ''}
                  onChange={(e) => {
                    const newComments = formData.sectionComments.filter(sc => sc.sectionId !== sectionKey);
                    if (e.target.value) {
                      newComments.push({ sectionId: sectionKey, comment: e.target.value });
                    }
                    setFormData({ ...formData, sectionComments: newComments });
                  }}
                  placeholder="Add your comments..."
                />
              </div>
            ))}
          </div>

          {/* Overall Rating */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={formData.overallRating}
              onChange={(e) => setFormData({ ...formData, overallRating: parseInt(e.target.value) })}
            >
              <option value={0}>Select rating</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Below Expectations</option>
              <option value={3}>3 - Meets Expectations</option>
              <option value={4}>4 - Exceeds Expectations</option>
              <option value={5}>5 - Outstanding</option>
            </select>
          </div>

          {/* Overall Comment */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Manager Comment *
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              rows={4}
              value={formData.overallComment}
              onChange={(e) => setFormData({ ...formData, overallComment: e.target.value })}
              placeholder="Provide your overall assessment..."
            />
          </div>

          {/* Contract/Probation Recommendations */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contract/Probation Recommendations</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.contractBlock.probationConfirm}
                  onChange={(e) => setFormData({
                    ...formData,
                    contractBlock: { ...formData.contractBlock, probationConfirm: e.target.checked }
                  })}
                />
                <span className="text-sm">The appointment should be confirmed (for probation)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.contractBlock.probationDoNotConfirm}
                  onChange={(e) => setFormData({
                    ...formData,
                    contractBlock: { ...formData.contractBlock, probationDoNotConfirm: e.target.checked }
                  })}
                />
                <span className="text-sm">The appointment should not be confirmed (for probation)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.contractBlock.contractNegotiate}
                  onChange={(e) => setFormData({
                    ...formData,
                    contractBlock: { ...formData.contractBlock, contractNegotiate: e.target.checked }
                  })}
                />
                <span className="text-sm">A new contract should be negotiated and prepared</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.contractBlock.contractDoNotRenew}
                  onChange={(e) => setFormData({
                    ...formData,
                    contractBlock: { ...formData.contractBlock, contractDoNotRenew: e.target.checked }
                  })}
                />
                <span className="text-sm">The contract should not be renewed</span>
              </label>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments on Overall Performance & Recommendation
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
                value={formData.contractBlock.narrative}
                onChange={(e) => setFormData({
                  ...formData,
                  contractBlock: { ...formData.contractBlock, narrative: e.target.value }
                })}
                placeholder="Add your narrative..."
              />
            </div>
          </div>

          {/* Signature */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manager Signature *
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
            <p className="text-xs text-gray-500 mt-1">
              By typing your name, you are providing your digital signature
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleSaveDraft}
              disabled={saveDraftMutation.isPending}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saveDraftMutation.isPending ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitReviewMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
// import { Separator } from '../components/ui/separator';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Lock, 
  PenTool,
  User,
  Users,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SignaturePad } from '../components/SignaturePad';

// interface FinalReviewData {
//   id: string;
//   appraisalId: string;
//   employeeComments?: string;
//   employeeSignature?: string;
//   employeeSignedAt?: string;
//   employeeSigner?: {
//     name: string;
//     email: string;
//   };
//   supervisorComments?: string;
//   supervisorSignature?: string;
//   supervisorSignedAt?: string;
//   supervisorSigner?: {
//     name: string;
//     email: string;
//   };
//   divisionalComments?: string;
//   divisionalHeadSignature?: string;
//   divisionalHeadSignedAt?: string;
//   divisionalSigner?: {
//     name: string;
//     email: string;
//   };
//   recommendationType?: string;
//   recommendationAction?: string;
//   additionalNotes?: string;
//   hrFinalizedAt?: string;
//   isLocked: boolean;
//   appraisal: {
//     employee: {
//       name: string;
//       email: string;
//       dept: string;
//       title: string;
//     };
//     template: {
//       name: string;
//       displayName: string;
//     };
//     cycle: {
//       name: string;
//     };
//   };
// }

export function FinalReviewPage() {
  const { appraisalId } = useParams<{ appraisalId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<'employee' | 'supervisor' | 'divisional' | 'hr'>('employee');
  const [signatureData, setSignatureData] = useState<string>('');

  // Fetch final review data
  const { data: finalReview, isLoading, error } = useQuery({
    queryKey: ['final-review', appraisalId],
    queryFn: async () => {
      const response = await fetch(`/api/final-reviews/${appraisalId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch final review');
      return response.json();
    },
    enabled: !!appraisalId
  });

  // Update final review mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/final-reviews/${appraisalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-review', appraisalId] });
      toast.success('Final review updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update final review');
      console.error('Update error:', error);
    }
  });

  // Employee sign mutation
  const employeeSignMutation = useMutation({
    mutationFn: async (data: { signature: string; comments?: string }) => {
      const response = await fetch(`/api/final-reviews/${appraisalId}/employee-sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Sign failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-review', appraisalId] });
      toast.success('Employee signature recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record signature');
      console.error('Sign error:', error);
    }
  });

  // Supervisor sign mutation
  const supervisorSignMutation = useMutation({
    mutationFn: async (data: { signature: string; comments?: string }) => {
      const response = await fetch(`/api/final-reviews/${appraisalId}/supervisor-sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Sign failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-review', appraisalId] });
      toast.success('Supervisor signature recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record signature');
      console.error('Sign error:', error);
    }
  });

  // Divisional sign mutation
  const divisionalSignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/final-reviews/${appraisalId}/divisional-sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Sign failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-review', appraisalId] });
      toast.success('Divisional signature and recommendation recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record signature');
      console.error('Sign error:', error);
    }
  });

  // HR finalize mutation
  const hrFinalizeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/final-reviews/${appraisalId}/hr-finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Finalize failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-review', appraisalId] });
      toast.success('Final review locked and archived successfully');
    },
    onError: (error) => {
      toast.error('Failed to finalize review');
      console.error('Finalize error:', error);
    }
  });

  const handleEmployeeSign = () => {
    if (!signatureData) {
      toast.error('Please provide a signature');
      return;
    }
    employeeSignMutation.mutate({ signature: signatureData });
  };

  const handleSupervisorSign = () => {
    if (!signatureData) {
      toast.error('Please provide a signature');
      return;
    }
    supervisorSignMutation.mutate({ signature: signatureData });
  };

  const handleDivisionalSign = (recommendationData: any) => {
    if (!signatureData) {
      toast.error('Please provide a signature');
      return;
    }
    divisionalSignMutation.mutate({
      ...recommendationData,
      divisionalHeadSignature: signatureData
    });
  };

  const getStatusBadge = (signedAt?: string, signer?: any) => {
    if (signedAt && signer) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Signed by {signer.name}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !finalReview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Final Review</h2>
        <p className="text-gray-600">There was an error loading the final review.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Final Review & Recommendation</h1>
          <p className="text-gray-600">
            {finalReview.appraisal.employee.name} • {finalReview.appraisal.template.displayName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {finalReview.isLocked ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Locked & Archived
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1">
              <PenTool className="h-3 w-3" />
              In Progress
            </Badge>
          )}
        </div>
      </div>

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Name</Label>
              <p className="text-lg font-semibold">{finalReview.appraisal.employee.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Department</Label>
              <p className="text-lg font-semibold">{finalReview.appraisal.employee.dept}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Title</Label>
              <p className="text-lg font-semibold">{finalReview.appraisal.employee.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Cycle</Label>
              <p className="text-lg font-semibold">{finalReview.appraisal.cycle.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSection('employee')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeSection === 'employee' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <User className="h-4 w-4" />
              Employee
              {getStatusBadge(finalReview.employeeSignedAt, finalReview.employeeSigner)}
            </button>
            <button
              onClick={() => setActiveSection('supervisor')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeSection === 'supervisor' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <Users className="h-4 w-4" />
              Supervisor
              {getStatusBadge(finalReview.supervisorSignedAt, finalReview.supervisorSigner)}
            </button>
            <button
              onClick={() => setActiveSection('divisional')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeSection === 'divisional' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <Shield className="h-4 w-4" />
              Divisional
              {getStatusBadge(finalReview.divisionalHeadSignedAt, finalReview.divisionalSigner)}
            </button>
            <button
              onClick={() => setActiveSection('hr')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeSection === 'hr' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              HR Final
              {finalReview.isLocked ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Finalized
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Section Content */}
      {activeSection === 'employee' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Acknowledgement
            </CardTitle>
            <CardDescription>
              Employee comments on overall performance and recommendation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="employeeComments">Employee Comments</Label>
              <Textarea
                id="employeeComments"
                placeholder="Please provide your comments on the overall performance and recommendation..."
                value={finalReview.employeeComments || ''}
                onChange={(e) => updateMutation.mutate({ employeeComments: e.target.value })}
                disabled={finalReview.employeeSignedAt || finalReview.isLocked}
                className="min-h-[120px]"
              />
            </div>

            {!finalReview.employeeSignedAt && !finalReview.isLocked && (
              <div className="space-y-4">
                <Label>Digital Signature</Label>
                <SignaturePad
                  onSignatureChange={setSignatureData}
                  disabled={false}
                />
                <Button
                  onClick={handleEmployeeSign}
                  disabled={!signatureData || employeeSignMutation.isPending}
                  className="w-full"
                >
                  {employeeSignMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <PenTool className="h-4 w-4 mr-2" />
                      Sign as Employee
                    </>
                  )}
                </Button>
              </div>
            )}

            {finalReview.employeeSignedAt && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Employee Signature Recorded</span>
                </div>
                <p className="text-sm text-green-700">
                  Signed by {finalReview.employeeSigner?.name} on{' '}
                  {new Date(finalReview.employeeSignedAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'supervisor' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Supervisor Recommendation
            </CardTitle>
            <CardDescription>
              Head of Department comments and recommendation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="supervisorComments">Supervisor Comments</Label>
              <Textarea
                id="supervisorComments"
                placeholder="Please provide your comments on the overall performance and recommendation..."
                value={finalReview.supervisorComments || ''}
                onChange={(e) => updateMutation.mutate({ supervisorComments: e.target.value })}
                disabled={finalReview.supervisorSignedAt || finalReview.isLocked}
                className="min-h-[120px]"
              />
            </div>

            {!finalReview.supervisorSignedAt && !finalReview.isLocked && (
              <div className="space-y-4">
                <Label>Digital Signature</Label>
                <SignaturePad
                  onSignatureChange={setSignatureData}
                  disabled={false}
                />
                <Button
                  onClick={handleSupervisorSign}
                  disabled={!signatureData || supervisorSignMutation.isPending}
                  className="w-full"
                >
                  {supervisorSignMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <PenTool className="h-4 w-4 mr-2" />
                      Sign as Supervisor
                    </>
                  )}
                </Button>
              </div>
            )}

            {finalReview.supervisorSignedAt && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Supervisor Signature Recorded</span>
                </div>
                <p className="text-sm text-green-700">
                  Signed by {finalReview.supervisorSigner?.name} on{' '}
                  {new Date(finalReview.supervisorSignedAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'divisional' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Divisional Head Recommendation
            </CardTitle>
            <CardDescription>
              Final divisional recommendation and contract status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="divisionalComments">Divisional Head Comments</Label>
              <Textarea
                id="divisionalComments"
                placeholder="Please provide your final divisional recommendation..."
                value={finalReview.divisionalComments || ''}
                onChange={(e) => updateMutation.mutate({ divisionalComments: e.target.value })}
                disabled={finalReview.divisionalHeadSignedAt || finalReview.isLocked}
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Recommendation Type</Label>
                <select
                  value={finalReview.recommendationType || ''}
                  onChange={(e) => updateMutation.mutate({ recommendationType: e.target.value })}
                  disabled={finalReview.divisionalHeadSignedAt || finalReview.isLocked}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="PROBATION">Probation</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="PERMANENT">Permanent</option>
                </select>
              </div>
              <div>
                <Label>Recommendation Action</Label>
                <select
                  value={finalReview.recommendationAction || ''}
                  onChange={(e) => updateMutation.mutate({ recommendationAction: e.target.value })}
                  disabled={finalReview.divisionalHeadSignedAt || finalReview.isLocked}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select action...</option>
                  <option value="CONFIRM">Confirm Appointment</option>
                  <option value="DO_NOT_CONFIRM">Do Not Confirm</option>
                  <option value="RENEW_CONTRACT">Renew Contract</option>
                  <option value="DO_NOT_RENEW">Do Not Renew</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any additional notes or specifications..."
                value={finalReview.additionalNotes || ''}
                onChange={(e) => updateMutation.mutate({ additionalNotes: e.target.value })}
                disabled={finalReview.divisionalHeadSignedAt || finalReview.isLocked}
                className="min-h-[80px]"
              />
            </div>

            {!finalReview.divisionalHeadSignedAt && !finalReview.isLocked && (
              <div className="space-y-4">
                <Label>Digital Signature</Label>
                <SignaturePad
                  onSignatureChange={setSignatureData}
                  disabled={false}
                />
                <Button
                  onClick={() => handleDivisionalSign({
                    divisionalComments: finalReview.divisionalComments,
                    recommendationType: finalReview.recommendationType,
                    recommendationAction: finalReview.recommendationAction,
                    additionalNotes: finalReview.additionalNotes
                  })}
                  disabled={!signatureData || divisionalSignMutation.isPending}
                  className="w-full"
                >
                  {divisionalSignMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <PenTool className="h-4 w-4 mr-2" />
                      Sign as Divisional Head
                    </>
                  )}
                </Button>
              </div>
            )}

            {finalReview.divisionalHeadSignedAt && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Divisional Head Signature Recorded</span>
                </div>
                <p className="text-sm text-green-700">
                  Signed by {finalReview.divisionalSigner?.name} on{' '}
                  {new Date(finalReview.divisionalHeadSignedAt).toLocaleString()}
                </p>
                {finalReview.recommendationAction && (
                  <p className="text-sm text-green-700 mt-1">
                    Recommendation: {finalReview.recommendationAction.replace('_', ' ')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'hr' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              HR Finalization
            </CardTitle>
            <CardDescription>
              Review all signatures and finalize the appraisal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary of all signatures */}
            <div className="space-y-4">
              <h3 className="font-semibold">Signature Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Employee</span>
                  </div>
                  {finalReview.employeeSignedAt ? (
                    <div className="text-sm text-green-600">
                      ✓ Signed by {finalReview.employeeSigner?.name}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      ✗ Pending signature
                    </div>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Supervisor</span>
                  </div>
                  {finalReview.supervisorSignedAt ? (
                    <div className="text-sm text-green-600">
                      ✓ Signed by {finalReview.supervisorSigner?.name}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      ✗ Pending signature
                    </div>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Divisional</span>
                  </div>
                  {finalReview.divisionalHeadSignedAt ? (
                    <div className="text-sm text-green-600">
                      ✓ Signed by {finalReview.divisionalSigner?.name}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      ✗ Pending signature
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Final recommendation summary */}
            {finalReview.recommendationAction && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-semibold text-blue-800 mb-2">Final Recommendation</h4>
                <p className="text-sm text-blue-700">
                  <strong>Action:</strong> {finalReview.recommendationAction.replace('_', ' ')}
                </p>
                {finalReview.recommendationType && (
                  <p className="text-sm text-blue-700">
                    <strong>Type:</strong> {finalReview.recommendationType}
                  </p>
                )}
                {finalReview.additionalNotes && (
                  <p className="text-sm text-blue-700">
                    <strong>Notes:</strong> {finalReview.additionalNotes}
                  </p>
                )}
              </div>
            )}

            {/* HR Finalize Button */}
            {!finalReview.isLocked && (
              <div className="space-y-4">
                {(!finalReview.employeeSignedAt || !finalReview.supervisorSignedAt || !finalReview.divisionalHeadSignedAt) && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Cannot Finalize</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      All required signatures must be completed before finalization.
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => hrFinalizeMutation.mutate()}
                  disabled={
                    !finalReview.employeeSignedAt || 
                    !finalReview.supervisorSignedAt || 
                    !finalReview.divisionalHeadSignedAt ||
                    hrFinalizeMutation.isPending
                  }
                  className="w-full"
                  size="lg"
                >
                  {hrFinalizeMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock and Archive Appraisal
                    </>
                  )}
                </Button>
              </div>
            )}

            {finalReview.isLocked && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Appraisal Finalized</span>
                </div>
                <p className="text-sm text-green-700">
                  This appraisal has been locked and archived. All signatures are final.
                </p>
                {finalReview.hrFinalizedAt && (
                  <p className="text-sm text-green-700 mt-1">
                    Finalized on {new Date(finalReview.hrFinalizedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

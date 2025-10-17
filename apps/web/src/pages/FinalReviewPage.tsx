import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Loader2, CheckCircle, XCircle, ArrowLeft, FileText, User, Calendar, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AppraisalData {
  id: string;
  employee: {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    dept: string;
  };
  template: {
    name: string;
    type: string;
  };
  cycle: {
    name: string;
    periodStart: string;
    periodEnd: string;
  };
  status: string;
  stage: string;
  overallScore: number;
  managerComment: string;
  divisionalHeadComments: string;
  divisionalHeadDecision: string;
  divisionalHeadReviewedAt: string;
  divisionalHeadSignedName: string;
  divisionalHeadSignedAt: string;
  formData: any;
  sections: any[];
  responses: any[];
  goals: any[];
  createdAt: string;
  updatedAt: string;
}

interface FinalReviewData {
  overallPerformanceComments: string;
  confirmAppointment: boolean;
  extendProbation: boolean;
  recommendTermination: boolean;
  recommendNewContract: boolean;
  finalApproverSignature: string;
  finalApproverSignedAt: string;
}

export function FinalReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [reviewData, setReviewData] = useState<FinalReviewData>({
    overallPerformanceComments: '',
    confirmAppointment: false,
    extendProbation: false,
    recommendTermination: false,
    recommendNewContract: false,
    finalApproverSignature: '',
    finalApproverSignedAt: ''
  });

  // Fetch appraisal data
  const { data: appraisal, isLoading, error } = useQuery<AppraisalData>({
    queryKey: ['appraisal', id],
    queryFn: async () => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch appraisal');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id
  });

  // Submit final review
  const submitFinalReviewMutation = useMutation({
    mutationFn: async (finalReviewData: FinalReviewData) => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}/final-review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...finalReviewData,
          status: 'AWAITING_HR',
          finalApproverReviewedAt: new Date().toISOString(),
          finalApproverReviewedBy: user?.id
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit final review');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
      navigate('/dashboard');
    }
  });

  const handleSubmit = () => {
    if (!reviewData.overallPerformanceComments.trim()) {
      alert('Please provide overall performance comments');
      return;
    }

    if (!reviewData.confirmAppointment && !reviewData.extendProbation && 
        !reviewData.recommendTermination && !reviewData.recommendNewContract) {
      alert('Please select at least one recommendation option');
      return;
    }

    if (!reviewData.finalApproverSignature.trim()) {
      alert('Please provide your signature');
      return;
    }

    submitFinalReviewMutation.mutate({
      ...reviewData,
      finalApproverSignedAt: new Date().toISOString()
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    if (score >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Satisfactory';
    if (score >= 1.5) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !appraisal) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Appraisal Not Found</h2>
            <p className="text-gray-600 mb-4">The requested appraisal could not be found.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Final Review</h1>
              <p className="text-gray-600">Complete final approval for performance appraisal</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {appraisal.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Employee</Label>
                <p className="text-lg font-semibold">
                  {appraisal.employee.firstName} {appraisal.employee.lastName}
                </p>
                <p className="text-sm text-gray-600">{appraisal.employee.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Position</Label>
                <p className="text-sm">{appraisal.employee.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Department</Label>
                <p className="text-sm">{appraisal.employee.dept}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Appraisal Period</Label>
                <p className="text-sm">
                  {new Date(appraisal.cycle.periodStart).toLocaleDateString()} - {' '}
                  {new Date(appraisal.cycle.periodEnd).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Overall Score</Label>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getScoreColor(appraisal.overallScore)}`}>
                    {((appraisal.overallScore / 5.0) * 100).toFixed(1)}%
                  </span>
                  <Badge variant="outline" className={getScoreColor(appraisal.overallScore)}>
                    {getScoreLabel(appraisal.overallScore)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Template Used</Label>
                <p className="text-sm">{appraisal.template.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Appraisal Stage</Label>
                <Badge variant="outline">{appraisal.stage}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supervisor Review */}
        {appraisal.divisionalHeadComments && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Supervisor Review
              </CardTitle>
              <CardDescription>
                Reviewed by {appraisal.divisionalHeadSignedName} on {' '}
                {new Date(appraisal.divisionalHeadReviewedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Supervisor Comments</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                    {appraisal.divisionalHeadComments}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Supervisor Decision</Label>
                  <Badge variant="outline" className="ml-2">
                    {appraisal.divisionalHeadDecision}
                  </Badge>
                </div>
                {appraisal.managerComment && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Manager Comments</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded-md">
                      {appraisal.managerComment}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Final Review & Recommendation</CardTitle>
            <CardDescription>
              Complete your final review and provide recommendations for HR action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Performance Comments */}
            <div>
              <Label htmlFor="comments" className="text-sm font-medium">
                Overall Performance Comments *
              </Label>
              <Textarea
                id="comments"
                placeholder="Provide your overall assessment and comments on the employee's performance..."
                value={reviewData.overallPerformanceComments}
                onChange={(e) => setReviewData(prev => ({ ...prev, overallPerformanceComments: e.target.value }))}
                className="mt-2 min-h-[120px]"
              />
            </div>

            <Separator />

            {/* Recommendation Options */}
            <div>
              <Label className="text-sm font-medium mb-4 block">
                Final Recommendation * (Select at least one)
              </Label>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="confirm"
                    checked={reviewData.confirmAppointment}
                    onCheckedChange={(checked) => 
                      setReviewData(prev => ({ ...prev, confirmAppointment: !!checked }))
                    }
                  />
                  <Label htmlFor="confirm" className="text-sm">
                    ✅ Confirm appointment
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="extend"
                    checked={reviewData.extendProbation}
                    onCheckedChange={(checked) => 
                      setReviewData(prev => ({ ...prev, extendProbation: !!checked }))
                    }
                  />
                  <Label htmlFor="extend" className="text-sm">
                    ✅ Extend probation
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="terminate"
                    checked={reviewData.recommendTermination}
                    onCheckedChange={(checked) => 
                      setReviewData(prev => ({ ...prev, recommendTermination: !!checked }))
                    }
                  />
                  <Label htmlFor="terminate" className="text-sm">
                    ✅ Recommend termination
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="contract"
                    checked={reviewData.recommendNewContract}
                    onCheckedChange={(checked) => 
                      setReviewData(prev => ({ ...prev, recommendNewContract: !!checked }))
                    }
                  />
                  <Label htmlFor="contract" className="text-sm">
                    ✅ Recommend new contract
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Signature */}
            <div>
              <Label htmlFor="signature" className="text-sm font-medium">
                Final Approver Signature *
              </Label>
              <input
                id="signature"
                type="text"
                placeholder="Enter your full name as signature"
                value={reviewData.finalApproverSignature}
                onChange={(e) => setReviewData(prev => ({ ...prev, finalApproverSignature: e.target.value }))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={submitFinalReviewMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitFinalReviewMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitFinalReviewMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Final Review
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
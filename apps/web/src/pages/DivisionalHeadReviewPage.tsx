import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle, User, FileText, Lock, Archive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/toast';


export function DivisionalHeadReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hrComments, setHrComments] = useState('');
  const [hrSignature, setHrSignature] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isDecisionLocked, setIsDecisionLocked] = useState(false);
  const commentsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is final approver (HR_ADMIN)
  const isFinalApprover = user?.role === 'HR_ADMIN';

  // Fetch appraisal instance
  const { data: appraisal, isLoading, error } = useQuery({
    queryKey: ['appraisal', id],
    queryFn: async () => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appraisal');
      }
      const result = await response.json();
      return result.data; // Extract data from the response
    },
    enabled: !!id,
  });

  // Load existing data when appraisal is fetched
  useEffect(() => {
    if (appraisal) {
      setComments(appraisal.divisionalHeadComments || '');
      setDecision(appraisal.divisionalHeadDecision || '');
      setIsApproved(appraisal.status === 'AWAITING_HR' || appraisal.status === 'COMPLETED');
      setIsDecisionLocked(!!appraisal.divisionalHeadDecision);
    }
  }, [appraisal]);

  // Auto-save mutation for comments and decisions
  const autoSaveMutation = useMutation({
    mutationFn: async ({ comments: reviewComments, decision: reviewDecision }: {
      comments?: string;
      decision?: string;
    }) => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          divisionalHeadComments: reviewComments,
          divisionalHeadDecision: reviewDecision,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to auto-save');
      }
      return response.json();
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
    },
  });

  // Update appraisal mutation
  const updateAppraisalMutation = useMutation({
    mutationFn: async ({ status, comments: reviewComments, decision: reviewDecision }: {
      status: string;
      comments?: string;
      decision?: string;
    }) => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          divisionalHeadComments: reviewComments,
          divisionalHeadDecision: reviewDecision,
          divisionalHeadReviewedAt: new Date().toISOString(),
          divisionalHeadSignedName: 'Divisional Head', // TODO: Get from auth context
          divisionalHeadSignedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appraisal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
      queryClient.invalidateQueries({ queryKey: ['appraisal', id] });
      navigate('/dashboard');
    },
  });

  // HR Complete Appraisal mutation
  const completeAppraisalMutation = useMutation({
    mutationFn: async ({ hrComments, hrSignature }: {
      hrComments?: string;
      hrSignature?: string;
    }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hrComments,
          hrSignature
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete appraisal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
      queryClient.invalidateQueries({ queryKey: ['appraisal', id] });
      addToast({
        title: 'Appraisal completed successfully!',
        type: 'success'
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      addToast({
        title: 'Failed to complete appraisal. Please try again.',
        type: 'error'
      });
      console.error('Error completing appraisal:', error);
    },
  });

  // Auto-save comments with debouncing
  const handleCommentsChange = (value: string) => {
    setComments(value);
    // Debounce auto-save
    if (commentsTimeoutRef.current) {
      clearTimeout(commentsTimeoutRef.current);
    }
    commentsTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        autoSaveMutation.mutate({ comments: value });
      }
    }, 1000);
  };

  // Handle decision change and auto-save
  const handleDecisionChange = (value: string) => {
    setDecision(value);
    setIsDecisionLocked(true);
    // Auto-save decision immediately
    autoSaveMutation.mutate({ decision: value });
  };

  const handleApproveAndForward = async () => {
    if (!comments.trim()) {
      alert('Please provide comments before approving.');
      return;
    }
    if (!decision) {
      alert('Please select a recommendation before approving.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAppraisalMutation.mutateAsync({
        status: 'AWAITING_HR',
        comments,
        decision,
      });
      setIsApproved(true);
    } catch (error) {
      console.error('Error approving appraisal:', error);
      alert('Failed to approve appraisal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToManager = async () => {
    if (!comments.trim()) {
      alert('Please provide comments explaining why the appraisal is being returned.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAppraisalMutation.mutateAsync({
        status: 'returned_to_manager',
        comments,
      });
    } catch (error) {
      console.error('Error returning appraisal:', error);
      alert('Failed to return appraisal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAppraisal = async () => {
    if (!hrComments.trim()) {
      alert('Please provide HR comments before completing the appraisal.');
      return;
    }
    if (!hrSignature.trim()) {
      alert('Please provide HR signature before completing the appraisal.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeAppraisalMutation.mutateAsync({
        hrComments,
        hrSignature
      });
    } catch (error) {
      console.error('Error completing appraisal:', error);
      alert('Failed to complete appraisal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      IN_REVIEW: 'bg-blue-100 text-blue-800',
      AWAITING_HR: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      RETURNED_TO_MANAGER: 'bg-red-100 text-red-800',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`;
  };

  const calculateOverallScore = () => {
    if (!appraisal?.sections || !Array.isArray(appraisal.sections)) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    appraisal.sections.forEach((sectionInstance: any) => {
      const section = sectionInstance.section;
      if (sectionInstance.score !== undefined && section?.maxScore > 0) {
        totalWeightedScore += (Number(sectionInstance.score) / Number(section.maxScore)) * (Number(section.weight) || 0);
        totalWeight += section.weight || 0;
      }
    });
    
    return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appraisal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('Appraisal fetch error:', error);
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load appraisal: {error.message}</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!appraisal) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Appraisal not found</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('Appraisal data:', appraisal);
  console.log('Appraisal status:', appraisal.status);
  console.log('Has sections:', !!appraisal.sections);
  console.log('Sections count:', appraisal.sections?.length || 0);

  // Calculate overall score properly - handle both raw scores and percentages
  const calculateDisplayScore = () => {
    const storedScore = appraisal.overallScore;
    const calculatedScore = calculateOverallScore();
    
    // Use stored score if available, otherwise use calculated score
    const rawScore = storedScore !== undefined && storedScore !== null ? storedScore : calculatedScore;
    
    // If the score appears to be out of 5 (raw format), convert to percentage
    if (rawScore > 0 && rawScore <= 5) {
      return Math.round((rawScore / 5) * 100);
    }
    
    // If it's already a percentage (0-100), return as is
    if (rawScore >= 0 && rawScore <= 100) {
      return Math.round(rawScore);
    }
    
    // Fallback: return the score as is
    return Math.round(rawScore);
  };

  const overallScore = calculateDisplayScore();

  // Special handling for draft appraisals
  if (appraisal.status === 'DRAFT' && (!appraisal.sections || appraisal.sections.length === 0)) {
    return (
      <Layout>
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 sticky top-0 bg-white z-30 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Draft Appraisal</h1>
                <p className="mt-2 text-gray-600">This appraisal is still in draft status</p>
              </div>
              <div className="text-right">
                <Badge className={getStatusBadge(appraisal.status)}>
                  {appraisal.status?.replace('_', ' ') || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Draft Appraisal</h3>
              <p className="text-gray-500 mb-6">
                This appraisal is still being prepared and doesn't have detailed sections yet.
              </p>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Employee Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Name:</span>
                      <span className="ml-2 font-medium">
                        {appraisal.employee?.user?.firstName} {appraisal.employee?.user?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Email:</span>
                      <span className="ml-2 font-medium">{appraisal.employee?.user?.email}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Department:</span>
                      <span className="ml-2 font-medium">{appraisal.employee?.dept}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Template:</span>
                      <span className="ml-2 font-medium">{appraisal.template?.name || 'Performance Review'}</span>
                    </div>
                  </div>
                </div>
                
                {(appraisal.selfAppraisalData || appraisal.managerReviewData) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Submitted Data</h4>
                    <p className="text-sm text-gray-600">
                      This draft contains some submitted data. Use the Edit button to modify the appraisal.
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-4 justify-center">
                  <Button
                    onClick={() => navigate(`/appraisals/${id}/edit`)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Edit Appraisal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/appraisals')}
                  >
                    Back to Appraisals
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sticky top-0 bg-white z-30 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Divisional Head Review</h1>
              <p className="mt-2 text-gray-600">Review and provide recommendation for performance appraisal</p>
            </div>
            <div className="text-right">
              <Badge className={getStatusBadge(appraisal.status)}>
                {appraisal.status?.replace('_', ' ') || 'Unknown'}
              </Badge>
              <div className="mt-2 text-sm text-gray-500">
                Overall Score: <span className="font-semibold text-lg">{overallScore}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appraisal Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{appraisal.employee.firstName} {appraisal.employee.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{appraisal.employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{appraisal.employee.dept}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium">{appraisal.employee.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appraisal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Appraisal Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Template</p>
                    <p className="font-medium">{appraisal.template.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cycle</p>
                    <p className="font-medium">{appraisal.cycle.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Period</p>
                    <p className="font-medium">
                      {new Date(appraisal.cycle.periodStart).toLocaleDateString()} - {' '}
                      {new Date(appraisal.cycle.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Overall Score</p>
                    <p className="font-medium text-lg">{overallScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submitted Appraisal Data */}
            {(appraisal.selfAppraisalData || appraisal.managerReviewData) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Submitted Appraisal Data
                  </CardTitle>
                  <CardDescription>
                    Employee's self-evaluation responses and scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Create competency mapping function that can be reused
                    const createCompetencyMapping = () => {
                      const competencyIdToName = new Map();
                      if (appraisal.competencies && Array.isArray(appraisal.competencies)) {
                        appraisal.competencies.forEach((ac: any) => {
                          if (ac.competency && ac.competency.id && ac.competency.name) {
                            competencyIdToName.set(ac.competency.id, ac.competency.name);
                          }
                        });
                      }
                      return competencyIdToName;
                    };

                    const competencyIdToName = createCompetencyMapping();

                    // Helper function to get competency name from key
                    const getCompetencyName = (key: string) => {
                      const competencyId = key.replace(/^(competency_|comments_)/, '');
                      const mappedName = competencyIdToName.get(competencyId);
                      if (mappedName) {
                        return mappedName;
                      }
                      // Fallback: try to extract name from the ID or use a cleaned version
                      return competencyId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    };

                    return (
                      <div className="space-y-4">
                    {appraisal.selfAppraisalData && (
                      <div>
                        <h4 className="font-medium text-lg mb-3">Self-Evaluation Data</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {(() => {
                            try {
                              const data = typeof appraisal.selfAppraisalData === 'string' 
                                ? JSON.parse(appraisal.selfAppraisalData) 
                                : appraisal.selfAppraisalData;
                              
                              return (
                                <div className="space-y-3">
                                  {Object.entries(data).map(([key, value]) => {
                                    if (key.startsWith('competency_') || key.startsWith('comments_')) {
                                      const competencyName = getCompetencyName(key);
                                      const isScore = key.startsWith('competency_');
                                      
                                      return (
                                        <div key={key} className="border-b border-gray-200 pb-2">
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium capitalize">
                                              {competencyName} {isScore ? 'Score' : 'Comments'}:
                                            </span>
                                            <span className={`px-2 py-1 rounded text-sm ${
                                              isScore 
                                                ? Number(value) >= 4 ? 'bg-green-100 text-green-800' : 
                                                  Number(value) >= 3 ? 'bg-yellow-100 text-yellow-800' : 
                                                  'bg-red-100 text-red-800'
                                                : 'text-gray-700'
                                            }`}>
                                              {isScore ? `${Number(value)}/5` : String(value)}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                  {data.digitalSignature && (
                                    <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                                      <p className="text-sm text-green-800">
                                        <strong>Digitally Signed:</strong> {data.submittedAt ? new Date(data.submittedAt).toLocaleString() : 'Unknown date'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch (error) {
                              return (
                                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                                  {typeof appraisal.selfAppraisalData === 'string' 
                                    ? appraisal.selfAppraisalData
                                    : JSON.stringify(appraisal.selfAppraisalData, null, 2)
                                  }
                                </pre>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    {appraisal.managerReviewData && (
                      <div>
                        <h4 className="font-medium text-lg mb-3">Manager Review Data</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {(() => {
                            try {
                              const data = typeof appraisal.managerReviewData === 'string' 
                                ? JSON.parse(appraisal.managerReviewData) 
                                : appraisal.managerReviewData;
                              
                              return (
                                <div className="space-y-4">
                                  {Object.entries(data).map(([key, value]) => {
                                    if (key.startsWith('competency_') || key.startsWith('comments_')) {
                                      const competencyName = getCompetencyName(key);
                                      const isScore = key.startsWith('competency_');
                                      
                                      if (isScore) {
                                        return (
                                          <div key={key} className="border-b border-gray-200 pb-2">
                                            <div className="flex justify-between items-center">
                                              <span className="font-medium capitalize">
                                                {competencyName} Score:
                                              </span>
                                              <span className={`px-2 py-1 rounded text-sm ${
                                                Number(value) >= 4 ? 'bg-green-100 text-green-800' : 
                                                Number(value) >= 3 ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'
                                              }`}>
                                                {Number(value)}/5
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={key} className="border-b border-gray-200 pb-3">
                                            <div className="space-y-1">
                                              <span className="font-medium capitalize text-sm text-gray-600">
                                                {competencyName} Comments:
                                              </span>
                                              <p className="text-sm text-gray-900 bg-white p-3 rounded border border-gray-200 min-h-[60px]">
                                                {String(value) || 'No comments provided'}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      }
                                    }
                                    return null;
                                  })}
                                  {data.digitalSignature && (
                                    <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                                      <p className="text-sm text-green-800">
                                        <strong>Digitally Signed:</strong> {data.submittedAt ? new Date(data.submittedAt).toLocaleString() : 'Unknown date'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch (error) {
                              return (
                                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                                  {typeof appraisal.managerReviewData === 'string' 
                                    ? appraisal.managerReviewData
                                    : JSON.stringify(appraisal.managerReviewData, null, 2)
                                  }
                                </pre>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    {overallScore > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-2">Overall Score</h4>
                        <p className="text-2xl font-bold text-blue-600">{overallScore}%</p>
                      </div>
                    )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Sections</CardTitle>
                <CardDescription>
                  Detailed breakdown of employee performance across all criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {appraisal.sections && appraisal.sections.length > 0 ? appraisal.sections.map((sectionInstance: any) => {
                    const section = sectionInstance.section;
                    return (
                      <div key={sectionInstance.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium text-lg">{section?.name || 'Section'}</h4>
                            <p className="text-sm text-gray-500">Weight: {section?.weight || 0}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {Number(sectionInstance.score) || 0}/{Number(section?.maxScore) || 0}
                            </p>
                            <p className="text-sm text-gray-500">
                              {Number(section?.maxScore) > 0 ? Math.round(((Number(sectionInstance.score) || 0) / Number(section.maxScore)) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                        
                        {sectionInstance.comments && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600"><strong>Comments:</strong></p>
                            <p className="text-sm">{String(sectionInstance.comments)}</p>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No detailed sections available for this appraisal.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Divisional Head Review Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Divisional Head Review
                </CardTitle>
                <CardDescription>
                  Provide your assessment and recommendation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Comments on Overall Performance and Recommendation *
                    {!isFinalApprover && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Read-only (Final Approver only)
                      </span>
                    )}
                  </label>
                  <Textarea
                    value={comments}
                    onChange={(e) => handleCommentsChange(e.target.value)}
                    placeholder="Provide detailed comments on the employee's performance and your recommendation..."
                    rows={6}
                    className="w-full"
                    readOnly={!isFinalApprover || isApproved}
                    disabled={!isFinalApprover || isApproved}
                  />
                </div>

                {/* Recommendation for Probation/Contract */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    Recommendation *
                    {!isFinalApprover && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Read-only (Final Approver only)
                      </span>
                    )}
                  </label>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-green-800 mb-3">For Persons on Probation:</h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="decision"
                            value="confirm"
                            checked={decision === 'confirm'}
                            onChange={(e) => handleDecisionChange(e.target.value)}
                            className="mr-2"
                            disabled={!isFinalApprover || isDecisionLocked}
                          />
                          <span className={!isFinalApprover || isDecisionLocked ? 'text-gray-500' : ''}>The appointment should be confirmed</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="decision"
                            value="do_not_confirm"
                            checked={decision === 'do_not_confirm'}
                            onChange={(e) => handleDecisionChange(e.target.value)}
                            className="mr-2"
                            disabled={!isFinalApprover || isDecisionLocked}
                          />
                          <span className={!isFinalApprover || isDecisionLocked ? 'text-gray-500' : ''}>The appointment should not be confirmed</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-3">For Persons on Contract:</h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="decision"
                            value="renew"
                            checked={decision === 'renew'}
                            onChange={(e) => handleDecisionChange(e.target.value)}
                            className="mr-2"
                            disabled={!isFinalApprover || isDecisionLocked}
                          />
                          <span className={!isFinalApprover || isDecisionLocked ? 'text-gray-500' : ''}>A new contract should be negotiated and prepared</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="decision"
                            value="do_not_renew"
                            checked={decision === 'do_not_renew'}
                            onChange={(e) => handleDecisionChange(e.target.value)}
                            className="mr-2"
                            disabled={!isFinalApprover || isDecisionLocked}
                          />
                          <span className={!isFinalApprover || isDecisionLocked ? 'text-gray-500' : ''}>The contract should not be renewed</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Divisional Head Signature:</strong> Divisional Head
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!isFinalApprover && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Action buttons are restricted to Final Approvers only
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleApproveAndForward}
                    disabled={isSubmitting || !isFinalApprover || isApproved}
                    className={`w-full ${isFinalApprover && !isApproved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isApproved ? 'Approved & Forwarded to HR' : (isSubmitting ? 'Processing...' : 'Approve & Forward to HR')}
                  </Button>
                  
                  <Button
                    onClick={handleReturnToManager}
                    disabled={isSubmitting || !isFinalApprover}
                    variant="outline"
                    className={`w-full ${isFinalApprover ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Processing...' : 'Return to Manager for Revision'}
                  </Button>
                </div>

                {/* HR Completion Section - Only show when status is AWAITING_HR and user is HR_ADMIN */}
                {appraisal?.status === 'AWAITING_HR' && user?.role === 'HR_ADMIN' && (
                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <Archive className="w-5 h-5 mr-2" />
                      HR Final Processing
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                      This appraisal has been approved by the divisional head and is ready for HR finalization.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          HR Comments *
                        </label>
                        <Textarea
                          value={hrComments}
                          onChange={(e) => setHrComments(e.target.value)}
                          placeholder="Add final HR comments..."
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          HR Signature *
                        </label>
                        <input
                          type="text"
                          value={hrSignature}
                          onChange={(e) => setHrSignature(e.target.value)}
                          placeholder="Enter your name for signature"
                          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <Button
                        onClick={handleCompleteAppraisal}
                        disabled={isSubmitting || !hrComments.trim() || !hrSignature.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Completing...' : 'Complete Appraisal'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

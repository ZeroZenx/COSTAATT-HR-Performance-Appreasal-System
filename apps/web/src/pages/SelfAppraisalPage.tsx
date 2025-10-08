import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
// import { Progress } from '../components/ui/progress';
// import { Separator } from '../components/ui/separator';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { 
  // Save, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Upload,
  Download,
  Edit,
  Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Removed unused interface

const questions = [
  {
    key: 'q1_accomplishments',
    title: 'Accomplishments',
    question: 'Over the past year, what have you done particularly well?',
    required: true,
    maxLength: 2000
  },
  {
    key: 'q2_improvements',
    title: 'Areas to Improve',
    question: 'What didn\'t go as well and why?',
    required: false,
    maxLength: 2000
  },
  {
    key: 'q3_satisfaction',
    title: 'Most Satisfying Work',
    question: 'What gave you the greatest personal satisfaction this year?',
    required: false,
    maxLength: 2000
  },
  {
    key: 'q4_obstacles',
    title: 'Obstacles',
    question: 'What were the key obstacles to accomplishing your responsibilities?',
    required: false,
    maxLength: 2000
  },
  {
    key: 'q5_roleChange',
    title: 'Role Shaping',
    question: 'Any changes to duties/responsibilities that would improve efficiency?',
    required: false,
    maxLength: 2000
  },
  {
    key: 'q6_training',
    title: 'Training & Development',
    question: 'Do you need additional training? In which areas?',
    required: false,
    maxLength: 2000
  },
  {
    key: 'q7_goals',
    title: 'Goals for Next Period',
    question: 'List your goals and the support/resources you need.',
    required: true,
    maxLength: 2000
  },
  {
    key: 'q8_suggestions',
    title: 'Suggestions',
    question: 'Any suggestions to improve efficiency or job satisfaction in your section or the College?',
    required: false,
    maxLength: 2000
  }
];

export function SelfAppraisalPage() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Fetch self-appraisal data
  const { data: selfAppraisal, isLoading, error } = useQuery({
    queryKey: ['self-appraisal', cycleId],
    queryFn: async () => {
      const response = await fetch(`/api/self-appraisals/mine?cycleId=${cycleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch self-appraisal');
      return response.json();
    },
    enabled: !!cycleId
  });

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/self-appraisals/${selfAppraisal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers: data })
      });
      if (!response.ok) throw new Error('Auto-save failed');
      return response.json();
    },
    onSuccess: () => {
      setLastSaved(new Date());
      setIsAutoSaving(false);
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
      setIsAutoSaving(false);
    }
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/self-appraisals/${selfAppraisal.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Submit failed');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Self-appraisal submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['self-appraisal', cycleId] });
    },
    onError: (error) => {
      toast.error('Failed to submit self-appraisal');
      console.error('Submit error:', error);
    }
  });

  // Initialize answers when data loads
  useEffect(() => {
    if (selfAppraisal?.answers) {
      setAnswers(selfAppraisal.answers);
    }
  }, [selfAppraisal]);

  // Auto-save effect
  useEffect(() => {
    if (!selfAppraisal || selfAppraisal.status === 'SUBMITTED' || selfAppraisal.status === 'LOCKED_TO_FINAL') {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (Object.keys(answers).length > 0) {
        setIsAutoSaving(true);
        autoSaveMutation.mutate(answers);
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [answers, selfAppraisal]);

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (submitMutation.isPending) return;
    submitMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'NOT_STARTED': { label: 'Not Started', variant: 'secondary' as const, icon: Clock },
      'IN_PROGRESS': { label: 'In Progress', variant: 'default' as const, icon: Edit },
      'SUBMITTED': { label: 'Submitted', variant: 'default' as const, icon: CheckCircle },
      'RETURNED_FOR_EDITS': { label: 'Returned for Edits', variant: 'destructive' as const, icon: AlertCircle },
      'LOCKED_TO_FINAL': { label: 'Locked to Final', variant: 'secondary' as const, icon: Lock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['NOT_STARTED'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isEditable = selfAppraisal && ['NOT_STARTED', 'IN_PROGRESS', 'RETURNED_FOR_EDITS'].includes(selfAppraisal.status);
  const canSubmit = selfAppraisal && isEditable && selfAppraisal.status !== 'SUBMITTED';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Self-Appraisal</h2>
        <p className="text-gray-600">There was an error loading your self-appraisal.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (!selfAppraisal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Self-Appraisal Not Found</h2>
        <p className="text-gray-600">No self-appraisal found for this cycle.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue(selfAppraisal.dueDate);
  const isOverdue = daysUntilDue < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Self-Appraisal</h1>
          <p className="text-gray-600">{selfAppraisal.cycle.name}</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(selfAppraisal.status)}
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Due: {new Date(selfAppraisal.dueDate).toLocaleDateString()}
            </p>
            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} days` : `${daysUntilDue} days remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Name</Label>
              <p className="text-lg font-semibold">{selfAppraisal.employee.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Department</Label>
              <p className="text-lg font-semibold">{selfAppraisal.employee.dept}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Title</Label>
              <p className="text-lg font-semibold">{selfAppraisal.employee.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Supervisor</Label>
              <p className="text-lg font-semibold">
                {selfAppraisal.supervisor?.name || 'Not assigned'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Reason Banner */}
      {selfAppraisal.status === 'RETURNED_FOR_EDITS' && selfAppraisal.returnReason && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Returned for Edits</h3>
                <p className="text-orange-700 mt-1">{selfAppraisal.returnReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <LoadingSpinner size="sm" />
          Auto-saving...
        </div>
      )}

      {lastSaved && !isAutoSaving && (
        <div className="text-sm text-gray-600">
          Last saved at {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {index + 1}. {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {answers[question.key]?.length || 0} / {question.maxLength} characters
                  </span>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Add Attachment
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{question.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={answers[question.key] || ''}
                onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                placeholder={`Please provide your response to: ${question.question}`}
                className="min-h-[120px]"
                maxLength={question.maxLength}
                disabled={!isEditable}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  {question.required && !answers[question.key] && (
                    <span className="text-red-500">This field is required</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {answers[question.key]?.length || 0} / {question.maxLength}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Save Draft & Return Later
              </Button>
              {canSubmit && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {submitMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit to Supervisor
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

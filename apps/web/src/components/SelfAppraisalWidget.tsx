import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LoadingSpinner } from './ui/loading-spinner';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit,
  Lock,
  // ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SelfAppraisalWidgetProps {
  cycleId?: string;
}

export function SelfAppraisalWidget({ cycleId }: SelfAppraisalWidgetProps) {
  const navigate = useNavigate();

  const { data: selfAppraisal, isLoading, error } = useQuery({
    queryKey: ['self-appraisal', cycleId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/self-appraisal?cycleId=${cycleId}`);
      if (!response.ok) throw new Error('Failed to fetch self-appraisal');
      return response.json();
    },
    enabled: !!cycleId
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      'NOT_STARTED': { 
        label: 'Not Started', 
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      'IN_PROGRESS': { 
        label: 'In Progress', 
        variant: 'default' as const, 
        icon: Edit,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      'SUBMITTED': { 
        label: 'Submitted', 
        variant: 'default' as const, 
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      'RETURNED_FOR_EDITS': { 
        label: 'Returned for Edits', 
        variant: 'destructive' as const, 
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      },
      'LOCKED_TO_FINAL': { 
        label: 'Locked to Final', 
        variant: 'secondary' as const, 
        icon: Lock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      }
    };

    return configs[status as keyof typeof configs] || configs['NOT_STARTED'];
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (answers: any) => {
    if (!answers) return 0;
    
    const requiredFields = ['q1_accomplishments', 'q7_goals'];
    const completedRequired = requiredFields.filter(key => 
      answers[key] && answers[key].trim().length > 0
    ).length;
    
    const allFields = Object.keys(answers);
    const completedAll = allFields.filter(key => 
      answers[key] && answers[key].trim().length > 0
    ).length;
    
    // Weight required fields more heavily
    return Math.round(((completedRequired * 2) + completedAll) / (requiredFields.length * 2 + allFields.length) * 100);
  };

  const getActionButton = () => {
    if (!selfAppraisal) return null;

    const isEditable = ['NOT_STARTED', 'IN_PROGRESS', 'RETURNED_FOR_EDITS'].includes(selfAppraisal.status);
    // const canSubmit = isEditable && selfAppraisal.status !== 'SUBMITTED';

    if (selfAppraisal.status === 'NOT_STARTED') {
      return (
        <Button 
          onClick={() => navigate(`/self-appraisal/${cycleId}`)}
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          Start Self-Appraisal
        </Button>
      );
    }

    if (isEditable) {
      return (
        <Button 
          onClick={() => navigate(`/self-appraisal/${cycleId}`)}
          variant="outline"
          className="w-full"
        >
          <Edit className="h-4 w-4 mr-2" />
          {selfAppraisal.status === 'RETURNED_FOR_EDITS' ? 'Review Feedback' : 'Continue Editing'}
        </Button>
      );
    }

    return (
      <Button 
        onClick={() => navigate(`/self-appraisal/${cycleId}`)}
        variant="outline"
        className="w-full"
      >
        <FileText className="h-4 w-4 mr-2" />
        View Self-Appraisal
      </Button>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Self-Appraisal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !selfAppraisal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Self-Appraisal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No self-appraisal available for this cycle.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const subject = encodeURIComponent('Self-Appraisal Access Request');
                const body = encodeURIComponent('Hello HR Team,\n\nI am requesting access to complete my self-appraisal for the current performance review cycle.\n\nThank you.');
                window.open(`mailto:hr@costaatt.edu.tt?subject=${subject}&body=${body}`);
              }}
            >
              Contact HR
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = getStatusConfig(selfAppraisal.status);
  const daysUntilDue = getDaysUntilDue(selfAppraisal.dueDate);
  const isOverdue = daysUntilDue < 0;
  const progress = getProgressPercentage(selfAppraisal.answers);
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Self-Appraisal
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          {selfAppraisal.cycle.name} • Due {new Date(selfAppraisal.dueDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Due Date Warning */}
        {isOverdue && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">
              Overdue by {Math.abs(daysUntilDue)} days
            </span>
          </div>
        )}

        {!isOverdue && daysUntilDue <= 3 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              Due in {daysUntilDue} days
            </span>
          </div>
        )}

        {/* Return Reason */}
        {selfAppraisal.status === 'RETURNED_FOR_EDITS' && selfAppraisal.returnReason && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Returned for Edits</p>
                <p className="text-xs text-orange-700 mt-1">{selfAppraisal.returnReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {getActionButton()}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{progress}%</p>
            <p className="text-xs text-gray-600">Complete</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {selfAppraisal.attachments?.length || 0}
            </p>
            <p className="text-xs text-gray-600">Attachments</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LoadingSpinner } from './ui/loading-spinner';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface CompletionRatesProps {
  data: any;
  isLoading: boolean;
}

export function CompletionRates({ data, isLoading }: CompletionRatesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completion Rates</CardTitle>
          <CardDescription>Appraisal completion status across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const departments = data?.departments || [];
  const overallCompletion = data?.overallCompletion || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Completion Rate</CardTitle>
          <CardDescription>System-wide appraisal completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm text-gray-600">{overallCompletion}%</span>
            </div>
            <Progress value={overallCompletion} className="h-2" />
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Completed: {data?.completed || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span>In Progress: {data?.inProgress || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Overdue: {data?.overdue || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Breakdown</CardTitle>
          <CardDescription>Completion rates by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map((dept: any) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={dept.completionRate >= 80 ? 'default' : dept.completionRate >= 60 ? 'secondary' : 'destructive'}>
                      {dept.completionRate}%
                    </Badge>
                  </div>
                </div>
                <Progress value={dept.completionRate} className="h-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Completed: {dept.completed}</span>
                  <span>Total: {dept.total}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


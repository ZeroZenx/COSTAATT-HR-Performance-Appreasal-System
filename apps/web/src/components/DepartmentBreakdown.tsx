import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LoadingSpinner } from './ui/loading-spinner';
import { Badge } from './ui/badge';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';

interface DepartmentBreakdownProps {
  data: any;
  isLoading: boolean;
}

export function DepartmentBreakdown({ data, isLoading }: DepartmentBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Performance metrics by department</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
        <CardDescription>Performance metrics by department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {departments.map((dept: any) => (
            <div key={dept.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">{dept.name}</h3>
                </div>
                <Badge variant={dept.averageScore >= 4 ? 'default' : dept.averageScore >= 3 ? 'secondary' : 'destructive'}>
                  {dept.averageScore}/5.0
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{dept.totalEmployees}</p>
                  <p className="text-sm text-gray-600">Total Employees</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{dept.completedAppraisals}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{dept.completionRate}%</p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{dept.averageScore}</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Outstanding</span>
                  <span className="font-medium">{dept.outstanding || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Exceeds Expectations</span>
                  <span className="font-medium">{dept.exceedsExpectations || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Meets Expectations</span>
                  <span className="font-medium">{dept.meetsExpectations || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Below Expectations</span>
                  <span className="font-medium">{dept.belowExpectations || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Unsatisfactory</span>
                  <span className="font-medium">{dept.unsatisfactory || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LoadingSpinner } from './ui/loading-spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceAnalyticsProps {
  data: any;
  isLoading: boolean;
}

export function PerformanceAnalytics({ data, isLoading }: PerformanceAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
          <CardDescription>Performance score distribution and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Outstanding', value: data?.outstanding || 0, color: '#10b981' },
    { name: 'Exceeds Expectations', value: data?.exceedsExpectations || 0, color: '#3b82f6' },
    { name: 'Meets Expectations', value: data?.meetsExpectations || 0, color: '#f59e0b' },
    { name: 'Below Expectations', value: data?.belowExpectations || 0, color: '#ef4444' },
    { name: 'Unsatisfactory', value: data?.unsatisfactory || 0, color: '#6b7280' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
        <CardDescription>Performance score distribution and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


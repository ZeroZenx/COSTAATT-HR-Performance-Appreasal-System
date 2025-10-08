import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LoadingSpinner } from './ui/loading-spinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface ScoreDistributionProps {
  data: any;
  isLoading: boolean;
}

export function ScoreDistribution({ data, isLoading }: ScoreDistributionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
          <CardDescription>Distribution of performance scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'Outstanding', value: data?.outstanding || 0, color: '#10b981' },
    { name: 'Exceeds Expectations', value: data?.exceedsExpectations || 0, color: '#3b82f6' },
    { name: 'Meets Expectations', value: data?.meetsExpectations || 0, color: '#f59e0b' },
    { name: 'Below Expectations', value: data?.belowExpectations || 0, color: '#ef4444' },
    { name: 'Unsatisfactory', value: data?.unsatisfactory || 0, color: '#6b7280' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
        <CardDescription>Distribution of performance scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  FileText,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { reportsApi } from '../lib/api';
import { PerformanceAnalytics } from '../components/PerformanceAnalytics';
import { ScoreDistribution } from '../components/ScoreDistribution';
import { CompletionRates } from '../components/CompletionRates';
import { DepartmentBreakdown } from '../components/DepartmentBreakdown';
import { ExportOptions } from '../components/ExportOptions';

export function ReportsPage() {
  const { user } = useAuth();
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch cycles for filter
  const { data: cycles } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => reportsApi.getCycles().then(res => res.data),
  });

  // Fetch departments for filter
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => reportsApi.getDepartments().then(res => res.data),
  });

  // Fetch performance scores
  const { data: performanceScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['reports', 'performance-scores', selectedCycle, selectedDepartment],
    queryFn: () => reportsApi.getPerformanceScores({
      cycleId: selectedCycle || undefined,
      department: selectedDepartment === 'all' ? undefined : selectedDepartment
    }).then(res => res.data),
  });

  // Fetch completion rates
  const { data: completionRates, isLoading: completionLoading } = useQuery({
    queryKey: ['reports', 'completion-rates', selectedCycle, selectedDepartment],
    queryFn: () => reportsApi.getCompletionRates({
      cycleId: selectedCycle || undefined,
      department: selectedDepartment === 'all' ? undefined : selectedDepartment
    }).then(res => res.data),
  });

  // Fetch department breakdown
  const { data: departmentBreakdown, isLoading: deptLoading } = useQuery({
    queryKey: ['reports', 'department-breakdown', selectedCycle],
    queryFn: () => reportsApi.getDepartmentBreakdown({
      cycleId: selectedCycle || undefined
    }).then(res => res.data),
  });

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Export functionality will be implemented
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-600">Analytics and insights for performance management</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCycle} onValueChange={setSelectedCycle}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Cycle" />
            </SelectTrigger>
            <SelectContent>
              {cycles?.map((cycle: any) => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map((dept: string) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportOptions onExport={handleExport} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appraisals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceScores?.totalAppraisals || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completionRates?.completionRate || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceScores?.averageScore || 0}/5.0
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departmentBreakdown ? Object.keys(departmentBreakdown).length : 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Scores
          </TabsTrigger>
          <TabsTrigger value="completion" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Completion
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Performance overview and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Performance Scores: {JSON.stringify(performanceScores)}</p>
              <p>Loading: {scoresLoading ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>Performance Score Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of performance scores across all appraisals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scoresLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {performanceScores?.outstanding || 0}
                      </p>
                      <p className="text-sm text-gray-600">Outstanding</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {performanceScores?.exceedsExpectations || 0}
                      </p>
                      <p className="text-sm text-gray-600">Exceeds Expectations</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {performanceScores?.meetsExpectations || 0}
                      </p>
                      <p className="text-sm text-gray-600">Meets Expectations</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Completion Rates</CardTitle>
              <CardDescription>Appraisal completion analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Completion Data: {JSON.stringify(completionRates)}</p>
              <p>Loading: {completionLoading ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Breakdown</CardTitle>
              <CardDescription>Department performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Department Data: {JSON.stringify(departmentBreakdown)}</p>
              <p>Loading: {deptLoading ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Historical performance trends and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Trend analysis coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


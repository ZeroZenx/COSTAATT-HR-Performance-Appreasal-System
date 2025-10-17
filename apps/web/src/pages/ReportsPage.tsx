import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Users, 
  Building, 
  Download,
  FileText,
  RefreshCw,
  AlertCircle,
  Star
} from 'lucide-react';

interface AnalyticsData {
  totalAppraisals: number;
  completedAppraisals: number;
  completionRate: number;
  averageScore: number;
  departments: Array<{
    name: string;
    count: number;
    completion: number;
  }>;
  trends: Array<{
    month: string;
    appraisals: number;
    completed: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  scoreDistribution: Array<{
    score: number;
    count: number;
    percentage: number;
  }>;
}

interface Cycle {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
}

interface Department {
  name: string;
  count: number;
}

export function ReportsPage() {
  const [selectedCycle, setSelectedCycle] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useQuery({
    queryKey: ['reports-analytics', selectedCycle, selectedDepartment],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCycle !== 'ALL') params.append('cycle', selectedCycle);
      if (selectedDepartment !== 'ALL') params.append('department', selectedDepartment);
      
      const response = await fetch(`http://10.2.1.27:3000/reports/analytics?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json() as Promise<AnalyticsData>;
    }
  });

  // Fetch appraisal cycles
  const { data: cycles } = useQuery({
    queryKey: ['appraisal-cycles'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/reports/cycles');
      if (!response.ok) {
        throw new Error('Failed to fetch cycles');
      }
      return response.json() as Promise<Cycle[]>;
    }
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/reports/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      return response.json() as Promise<Department[]>;
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'scores', label: 'Scores', icon: Star },
    { id: 'completion', label: 'Completion', icon: CheckCircle },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
  ];

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log('Export PDF functionality to be implemented');
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export functionality
    console.log('Export CSV functionality to be implemented');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'IN_REVIEW': 'bg-yellow-100 text-yellow-800',
      'REVIEWED_MANAGER': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 3.5) return 'bg-blue-100 text-blue-800';
    if (score >= 2.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-8 sticky top-0 bg-gray-50 z-30 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="mt-2 text-gray-600">Real-time performance insights and analytics dashboard</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => refetchAnalytics()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appraisal Cycle</label>
                  <select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ALL">All Cycles</option>
                    {cycles?.map((cycle) => (
                      <option key={cycle.id} value={cycle.name}>
                        {cycle.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ALL">All Departments</option>
                    {departments?.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name} ({dept.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => refetchAnalytics()}
                    className="w-full"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {analyticsLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading analytics data...</p>
            </div>
          )}

          {/* Error State */}
          {analyticsError && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-red-600 mb-2">Error loading analytics</p>
              <p className="text-sm text-gray-600 mb-4">{analyticsError.message}</p>
              <Button onClick={() => refetchAnalytics()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Analytics Data */}
          {analyticsData && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Appraisals</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.totalAppraisals}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.completionRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Average Score</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.averageScore}/5</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Building className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Departments</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.departments.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Card>
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                            activeTab === tab.id
                              ? 'border-purple-500 text-purple-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent className="h-4 w-4 mr-2" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Appraisal Status Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {analyticsData.statusDistribution.map((status, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 flex items-center">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)} mr-2`}>
                                        {status.status.replace('_', ' ')}
                                      </span>
                                      {status.percentage}%
                                    </span>
                                    <span className="text-sm font-medium">{status.count}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full" 
                                      style={{ width: `${status.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Score Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {analyticsData.scoreDistribution.map((score, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 flex items-center">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(score.score)} mr-2`}>
                                        {score.score}/5
                                      </span>
                                      {score.percentage}%
                                    </span>
                                    <span className="text-sm font-medium">{score.count}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${score.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Scores Tab */}
                  {activeTab === 'scores' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Score Analysis</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Overall Average</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-900 mb-2">
                                {analyticsData.averageScore}
                              </div>
                              <div className="text-sm text-gray-600">out of 5.0</div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${(analyticsData.averageScore / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Score Range</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {analyticsData.scoreDistribution.map((score, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">{score.score}/5</span>
                                  <span className="text-sm font-medium">{score.count} appraisals</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Performance Levels</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Outstanding (4.5+)</span>
                                <span className="text-sm font-medium text-green-600">
                                  {analyticsData.scoreDistribution.filter(s => s.score >= 4.5).reduce((sum, s) => sum + s.count, 0)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Good (3.5-4.4)</span>
                                <span className="text-sm font-medium text-blue-600">
                                  {analyticsData.scoreDistribution.filter(s => s.score >= 3.5 && s.score < 4.5).reduce((sum, s) => sum + s.count, 0)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Needs Improvement (&lt;3.5)</span>
                                <span className="text-sm font-medium text-red-600">
                                  {analyticsData.scoreDistribution.filter(s => s.score < 3.5).reduce((sum, s) => sum + s.count, 0)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Completion Tab */}
                  {activeTab === 'completion' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Completion Analysis</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Overall Completion</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-900 mb-2">
                                {analyticsData.completionRate}%
                              </div>
                              <div className="text-sm text-gray-600">
                                {analyticsData.completedAppraisals} of {analyticsData.totalAppraisals} appraisals
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                                <div 
                                  className="bg-green-600 h-3 rounded-full" 
                                  style={{ width: `${analyticsData.completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Status Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {analyticsData.statusDistribution.map((status, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)} mr-2`}>
                                      {status.status.replace('_', ' ')}
                                    </span>
                                  </span>
                                  <span className="text-sm font-medium">{status.count}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Departments Tab */}
                  {activeTab === 'departments' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Department Performance</h3>
                      <div className="space-y-4">
                        {analyticsData.departments.map((dept, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{dept.name}</h4>
                                  <p className="text-sm text-gray-500">{dept.count} appraisals</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-medium text-gray-900">{dept.completion}%</div>
                                  <div className="text-sm text-gray-500">Completion</div>
                                </div>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full" 
                                  style={{ width: `${dept.completion}%` }}
                                ></div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trends Tab */}
                  {activeTab === 'trends' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Monthly Appraisal Activity (Last 6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analyticsData.trends.map((trend, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">{trend.month}</span>
                                <div className="flex items-center space-x-4">
                                  <span className="text-sm text-gray-600">{trend.appraisals} total</span>
                                  <span className="text-sm text-gray-600">{trend.completed} completed</span>
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${trend.appraisals > 0 ? (trend.completed / trend.appraisals) * 100 : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </main>
      </div>
    </Layout>
  );
}
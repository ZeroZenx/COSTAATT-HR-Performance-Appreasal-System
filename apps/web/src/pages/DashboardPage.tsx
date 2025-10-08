import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { FileText, Users, BarChart3, Clock, CheckCircle, Plus, AlertTriangle } from 'lucide-react';
import { usePermissions } from '../components/RoleGuard';
import { RoleGuard } from '../components/RoleGuard';
import { SelfAppraisalWidget } from '../components/SelfAppraisalWidget';

export function DashboardPage() {
  const navigate = useNavigate();
  const { getDataScope, isEmployee, isSupervisor, isHRAdmin } = usePermissions();
  
  const dataScope = getDataScope();
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Fetch recent appraisals
  const { data: recentAppraisals, isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/dashboard/recent');
      if (!response.ok) throw new Error('Failed to fetch recent appraisals');
      return response.json();
    },
  });

  const isLoading = statsLoading || recentLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate pending actions based on role
  const pendingActions = recentAppraisals?.filter(a => 
    (isEmployee && a.status === 'DRAFT') ||
    (isSupervisor && a.status === 'MANAGER_REVIEW') ||
    (isHRAdmin && a.status === 'CALIBRATED')
  ).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the COSTAATT HR Performance Gateway</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appraisals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAppraisals || 0}</div>
            <p className="text-xs text-muted-foreground">
              All performance appraisals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.draftAppraisals || 0}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.submittedAppraisals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedAppraisals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Finished appraisals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appraisals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appraisals</CardTitle>
            <CardDescription>
              Latest performance appraisals in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!recentAppraisals || recentAppraisals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No appraisals found</p>
            ) : (
              <div className="space-y-4">
                {recentAppraisals.map((appraisal) => (
                  <div key={appraisal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {appraisal.employee?.user?.firstName} {appraisal.employee?.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appraisal.template?.name} • {appraisal.cycle?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appraisal.employee?.division} • {appraisal.employee?.employmentType}
                      </p>
                      {appraisal.updatedAt && (
                        <p className="text-xs text-gray-400">
                          Updated: {new Date(appraisal.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appraisal.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        appraisal.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-800' :
                        appraisal.status === 'REVIEWED_MANAGER' ? 'bg-purple-100 text-purple-800' :
                        appraisal.status === 'FINAL_REVIEW' ? 'bg-orange-100 text-orange-800' :
                        appraisal.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appraisal.status.replace('_', ' ')}
                      </span>
                      {appraisal.finalScore && (
                        <p className="text-sm text-gray-500 mt-1">
                          Score: {appraisal.finalScore.toFixed(1)}
                        </p>
                      )}
                      {/* Action Buttons */}
                      <div className="mt-2 space-x-2">
                        {(appraisal.status === 'IN_REVIEW' || appraisal.status === 'REVIEWED_MANAGER') && (
                          <button
                            onClick={() => navigate(`/appraisals/${appraisal.id}/review`)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Review
                          </button>
                        )}
                        {appraisal.status === 'REVIEWED_MANAGER' && (
                          <button
                            onClick={() => navigate(`/appraisals/${appraisal.id}/finalize`)}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                          >
                            Finalize
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Create New Appraisal - Only for Supervisors and HR */}
              <RoleGuard action="create" resource="appraisal">
                <button 
                  onClick={() => navigate('/appraisals/new')}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Create New Appraisal</p>
                      <p className="text-sm text-gray-500">Start a new performance appraisal</p>
                    </div>
                  </div>
                </button>
              </RoleGuard>

              {/* View Employees - Supervisors and HR only */}
              <RoleGuard action="view" resource="employee" context={{ scope: 'team' }}>
                <button 
                  onClick={() => navigate('/employees')}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {isSupervisor ? 'View Team' : 'View Employees'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isSupervisor ? 'Manage team members' : 'Manage employee records'}
                      </p>
                    </div>
                  </div>
                </button>
              </RoleGuard>

              {/* View Reports - Supervisors and HR only */}
              <RoleGuard action="view" resource="report">
                <button 
                  onClick={() => navigate('/reports')}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {isSupervisor ? 'Team Reports' : 'View Reports'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isSupervisor ? 'Team performance analytics' : 'Performance analytics and insights'}
                      </p>
                    </div>
                  </div>
                </button>
              </RoleGuard>

              {/* Employee-specific actions */}
              {isEmployee && (
                <button 
                  onClick={() => navigate('/appraisals')}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">My Appraisals</p>
                      <p className="text-sm text-gray-500">View your performance appraisals</p>
                    </div>
                  </div>
                </button>
              )}

              {/* Pending Actions for all roles */}
              {pendingActions > 0 && (
                <button 
                  onClick={() => navigate('/appraisals?filter=pending')}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-yellow-50 border-yellow-200"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Pending Actions ({pendingActions})</p>
                      <p className="text-sm text-gray-500">
                        {isEmployee ? 'Your appraisals need attention' : 
                         isSupervisor ? 'Team appraisals need your review' : 
                         'Appraisals need HR review'}
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Self-Appraisal Widget - Show for all users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SelfAppraisalWidget cycleId="current" />
        </div>
        <div className="lg:col-span-2">
          {/* Additional dashboard content can go here */}
        </div>
      </div>

    </div>
  );
}


import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeDashboard } from './EmployeeDashboard';
import { SupervisorDashboard } from './SupervisorDashboard';
import { 
  FileText, 
  Clock, 
  Users, 
  CheckCircle, 
  Plus, 
  BarChart3, 
  MessageCircle,
  Eye
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Role-based dashboard routing
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboard />;
  }

  if (user?.role === 'SUPERVISOR') {
    return <SupervisorDashboard />;
  }

  // Admin and Final Approver dashboard (existing functionality)
  // Fetch real appraisal data
  const { data: appraisals = [], isLoading } = useQuery({
    queryKey: ['appraisals'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/appraisals');
      if (!response.ok) {
        throw new Error('Failed to fetch appraisals');
      }
      const data = await response.json();
      return data.data || [];
    }
  });

  // Calculate stats
  const totalAppraisals = appraisals.length;
  const draftCount = appraisals.filter((a: any) => a.status === 'DRAFT').length;
  const inReviewCount = appraisals.filter((a: any) => a.status === 'IN_REVIEW').length;
  const completedCount = appraisals.filter((a: any) => a.status === 'COMPLETED').length;
  // const awaitingHrCount = appraisals.filter((a: any) => a.status === 'AWAITING_HR').length;
  // const returnedCount = appraisals.filter((a: any) => a.status === 'RETURNED_TO_MANAGER').length;

  const handleReviewAppraisal = (appraisalId: string) => {
    navigate(`/appraisals/${appraisalId}/review`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Draft</span>;
      case 'IN_REVIEW':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">In Review</span>;
      case 'AWAITING_HR':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Awaiting HR</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case 'RETURNED_TO_MANAGER':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Returned</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 sticky top-0 bg-white z-30 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to the COSTAATT HR Performance Gateway</p>
          </div>

          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/appraisals')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Appraisals</dt>
                      <dd className="text-2xl font-bold text-gray-900">{totalAppraisals}</dd>
                      <dd className="text-sm text-gray-500">All time</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/appraisals?status=draft')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Draft</dt>
                      <dd className="text-2xl font-bold text-gray-900">{draftCount}</dd>
                      <dd className="text-sm text-gray-500">In progress</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/appraisals?status=in_review')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Review</dt>
                      <dd className="text-2xl font-bold text-gray-900">{inReviewCount}</dd>
                      <dd className="text-sm text-gray-500">Pending approval</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/appraisals?status=completed')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-2xl font-bold text-gray-900">{completedCount}</dd>
                      <dd className="text-sm text-gray-500">Finished</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appraisals */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Appraisals</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="px-6 py-4 text-center text-gray-500">Loading appraisals...</div>
              ) : appraisals.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">No appraisals found</div>
              ) : (
                appraisals.slice(0, 5).map((appraisal: any) => (
                  <div key={appraisal.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleReviewAppraisal(appraisal.id)}>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {(appraisal.employee?.user?.firstName || appraisal.employee?.firstName)?.[0] || 'E'}{(appraisal.employee?.user?.lastName || appraisal.employee?.lastName)?.[0] || 'M'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appraisal.employee?.user?.firstName || appraisal.employee?.firstName} {appraisal.employee?.user?.lastName || appraisal.employee?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appraisal.template?.name} - {appraisal.cycle?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(appraisal.status)}
                      {appraisal.status === 'IN_REVIEW' && (
                        <Button
                          onClick={() => handleReviewAppraisal(appraisal.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      )}
                      {appraisal.status === 'COMPLETED' && (
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/appraisals/new-quick')}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Create New Appraisal</h3>
                  <p className="text-sm text-gray-500">Start a new performance review</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/settings?tab=users')}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">View Employees</h3>
                  <p className="text-sm text-gray-500">Manage staff directory</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/reports')}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-500">Analytics and insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6">
            <button className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
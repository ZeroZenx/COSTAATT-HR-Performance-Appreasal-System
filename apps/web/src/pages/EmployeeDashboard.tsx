import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  User,
  MessageCircle,
  Eye,
  Edit
} from 'lucide-react';

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch employee's own appraisals
  const { data: appraisals = [], isLoading } = useQuery({
    queryKey: ['employee-appraisals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const token = localStorage.getItem('token');
      const response = await fetch(`http://10.2.1.27:3000/appraisals/employee/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch appraisals');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!user?.id
  });

  // Calculate stats for employee
  const totalAppraisals = appraisals.length;
  const draftCount = appraisals.filter((a: any) => a.status === 'DRAFT').length;
  const inReviewCount = appraisals.filter((a: any) => a.status === 'IN_REVIEW').length;
  const completedCount = appraisals.filter((a: any) => a.status === 'COMPLETED').length;
  const awaitingHrCount = appraisals.filter((a: any) => a.status === 'AWAITING_HR').length;

  const handleViewAppraisal = (appraisalId: string) => {
    navigate(`/appraisals/${appraisalId}/edit`);
  };

  const handleSelfEvaluation = (appraisalId: string) => {
    navigate(`/appraisals/${appraisalId}/self-evaluation`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Draft</span>;
      case 'IN_REVIEW':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Under Review</span>;
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

  const getActionButton = (appraisal: any) => {
    switch (appraisal.status) {
      case 'DRAFT':
        return (
          <Button
            onClick={() => handleViewAppraisal(appraisal.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-1" />
            Continue
          </Button>
        );
      case 'IN_REVIEW':
        return (
          <Button variant="outline" size="sm" disabled>
            <Clock className="w-4 h-4 mr-1" />
            Under Review
          </Button>
        );
      case 'AWAITING_HR':
        return (
          <Button variant="outline" size="sm" disabled>
            <Clock className="w-4 h-4 mr-1" />
            Awaiting HR
          </Button>
        );
      case 'COMPLETED':
        return (
          <Button
            onClick={() => handleViewAppraisal(appraisal.id)}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 sticky top-0 bg-white z-30 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">My Performance Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user?.firstName}! Track your performance reviews and evaluations.</p>
          </div>

          {/* Employee-specific metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">My Appraisals</dt>
                      <dd className="text-2xl font-bold text-gray-900">{totalAppraisals}</dd>
                      <dd className="text-sm text-gray-500">All time</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Edit className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd className="text-2xl font-bold text-gray-900">{draftCount}</dd>
                      <dd className="text-sm text-gray-500">Needs completion</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Under Review</dt>
                      <dd className="text-2xl font-bold text-gray-900">{inReviewCount + awaitingHrCount}</dd>
                      <dd className="text-sm text-gray-500">Being evaluated</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
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

          {/* My Appraisals */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">My Performance Reviews</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="px-6 py-4 text-center text-gray-500">Loading your appraisals...</div>
              ) : appraisals.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>No performance reviews assigned yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Your supervisor will create appraisals for you.</p>
                </div>
              ) : (
                appraisals.map((appraisal: any) => (
                  <div key={appraisal.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appraisal.template?.name || 'Performance Review'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appraisal.cycle?.name || 'Annual Review'} - {new Date(appraisal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(appraisal.status)}
                      {getActionButton(appraisal)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Employee-specific quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/profile" className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-500">View and update your information</p>
                </div>
              </div>
            </Link>

            <Link to="/self-evaluation" className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Self-Evaluation</h3>
                  <p className="text-sm text-gray-500">Complete your self-assessment</p>
                </div>
              </div>
            </Link>

            <Link to="/self-evaluation/history" className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Self-Evaluation History</h3>
                  <p className="text-sm text-gray-500">View your submitted self-evaluations</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6">
            <Link to="/self-evaluation" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Eye,
  Calendar,
  User,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SelfEvaluationHistoryPage() {
  const { user } = useAuth();

  // Fetch all self-evaluations for the user
  const { data: selfEvaluations = [], isLoading, error } = useQuery({
    queryKey: ['self-evaluations-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const token = localStorage.getItem('token');
      const response = await fetch(`http://10.2.1.27:3000/self-evaluations/${user.id}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch self-evaluations');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'SELF_EVALUATION': { label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
      'IN_REVIEW': { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
      'COMPLETED': { label: 'Completed', color: 'bg-green-100 text-green-800' },
      'RETURNED_FOR_EDITS': { label: 'Returned', color: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your self-evaluations...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Self-Evaluations</h3>
              <p className="text-gray-600 mb-4">There was an error loading your self-evaluations.</p>
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Link 
                    to="/dashboard" 
                    className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-900">My Self-Evaluations</h1>
                </div>
                <p className="text-gray-600">View your submitted self-evaluation history</p>
              </div>
              <Link 
                to="/self-evaluation"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FileText className="w-4 h-4 mr-2" />
                New Self-Evaluation
              </Link>
            </div>
          </div>

          {/* Self-Evaluations List */}
          {selfEvaluations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Self-Evaluations Found</h3>
              <p className="text-gray-600 mb-6">You haven't submitted any self-evaluations yet.</p>
              <Link 
                to="/self-evaluation"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Your First Self-Evaluation
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {selfEvaluations.map((selfEval: any) => (
                <div key={selfEval.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Self-Evaluation
                        </h3>
                        <p className="text-sm text-gray-500">
                          Employee: {user?.firstName} {user?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(selfEval.status)}
                      <Link
                        to={`/self-evaluation/${selfEval.id}/view`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        View
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">Created</p>
                        <p className="text-gray-600">{formatDate(selfEval.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">Last Updated</p>
                        <p className="text-gray-600">{formatDate(selfEval.updatedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">Status</p>
                        <p className="text-gray-600">
                          {selfEval.status === 'IN_REVIEW' ? 'Submitted for Review' : 
                           selfEval.status === 'SELF_EVALUATION' ? 'Draft' : 
                           selfEval.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Preview of Responses */}
                  {selfEval.responses && Object.keys(selfEval.responses).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Preview</h4>
                      <div className="text-sm text-gray-600">
                        {selfEval.responses.question1 && (
                          <p className="truncate">
                            <strong>What you did well:</strong> {selfEval.responses.question1.substring(0, 100)}...
                          </p>
                        )}
                        {selfEval.responses.question2 && (
                          <p className="truncate mt-1">
                            <strong>Areas for improvement:</strong> {selfEval.responses.question2.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

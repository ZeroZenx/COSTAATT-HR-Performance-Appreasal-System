import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Calendar,
  User,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SelfEvaluationViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch the specific self-evaluation
  const { data: selfEvaluation, isLoading, error } = useQuery({
    queryKey: ['self-evaluation-view', id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      const token = localStorage.getItem('token');
      const response = await fetch(`http://10.2.1.27:3000/self-evaluations/${user.id}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch self-evaluation');
      }
      const data = await response.json();
      return data.data || null;
    },
    enabled: !!id && !!user?.id
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
                <p className="text-gray-600">Loading self-evaluation...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !selfEvaluation) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Self-Evaluation Not Found</h3>
              <p className="text-gray-600 mb-4">The requested self-evaluation could not be found.</p>
              <div className="flex justify-center space-x-3">
                <Link 
                  to="/self-evaluation/history" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to History
                </Link>
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const questions = [
    {
      id: 'question1',
      label: 'Looking at your own work over the past year, what things do you think you have done particularly well?'
    },
    {
      id: 'question2',
      label: 'Are there any aspects of your work which have not gone so well? If so, why was this?'
    },
    {
      id: 'question3',
      label: 'What has given you the greatest personal satisfaction about your work here over the past year?'
    },
    {
      id: 'question4',
      label: 'What were the key obstacles in accomplishing your job responsibilities?'
    },
    {
      id: 'question5',
      label: 'Is there any way in which you would want to change the duties/responsibilities of your job to improve efficiency in your section?'
    },
    {
      id: 'question6',
      label: 'Do you feel you and the Institution might benefit if you had additional training in any aspect of your work? If so, in what area?'
    },
    {
      id: 'question7',
      label: 'What goals do you have for the next review period? What type of support do you need?'
    },
    {
      id: 'question8',
      label: 'Are there any other suggestions you would like make to help improve efficiency or job satisfaction in your section or anywhere else in the organization?'
    }
  ];

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
                    to="/self-evaluation/history" 
                    className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-900">Self-Evaluation Details</h1>
                </div>
                <p className="text-gray-600">View your submitted self-evaluation</p>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(selfEvaluation.status)}
                {selfEvaluation.status === 'SELF_EVALUATION' && (
                  <Link
                    to="/self-evaluation"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="w-4 h-4 mr-1.5" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Self-Evaluation Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
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
                <div className="text-right">
                  <p className="text-sm text-gray-500">Evaluation ID</p>
                  <p className="text-xs font-mono text-gray-400">{selfEvaluation.id}</p>
                </div>
              </div>
            </div>

            {/* Status and Dates */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Created</p>
                    <p className="text-gray-600">{formatDate(selfEvaluation.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Last Updated</p>
                    <p className="text-gray-600">{formatDate(selfEvaluation.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Status</p>
                    <p className="text-gray-600">
                      {selfEvaluation.status === 'IN_REVIEW' ? 'Submitted for Review' : 
                       selfEvaluation.status === 'SELF_EVALUATION' ? 'Draft' : 
                       selfEvaluation.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="px-6 py-6">
              <h4 className="text-lg font-medium text-gray-900 mb-6">Your Responses</h4>
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      {index + 1}) {question.label}
                    </h5>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selfEvaluation.responses[question.id] || 'No response provided'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

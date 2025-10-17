import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeAppraisalsPage } from './EmployeeAppraisalsPage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appraisalsApi } from '../lib/api';

export function AppraisalsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchParams] = useSearchParams();

  // Route employees to their specific appraisals page
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeAppraisalsPage />;
  }

  // Get status filter from URL parameters
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam.toUpperCase());
    }
  }, [searchParams]);

  // Fetch real appraisal data
  const { data: appraisals = [], isLoading, error } = useQuery({
    queryKey: ['appraisals', statusFilter],
    queryFn: async () => {
      const url = new URL('http://10.2.1.27:3000/appraisals');
      if (statusFilter !== 'ALL') {
        url.searchParams.set('status', statusFilter.toLowerCase());
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch appraisals');
      }
      const data = await response.json();
      return data.data || [];
    }
  });

  // Delete appraisal mutation
  const deleteAppraisalMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('API call: Deleting appraisal with ID:', id);
      return appraisalsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
    },
    onError: (error: any) => {
      console.error('Error deleting appraisal:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred';
      alert(`Failed to delete appraisal: ${errorMessage}`);
    }
  });

  // Filter appraisals based on search term
  const filteredAppraisals = appraisals.filter(appraisal => {
    const employeeName = `${appraisal.employee?.user?.firstName || appraisal.employee?.firstName || ''} ${appraisal.employee?.user?.lastName || appraisal.employee?.lastName || ''}`.toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || appraisal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Click handlers for appraisal actions
  const handleViewAppraisal = (appraisalId: string) => {
    navigate(`/appraisals/${appraisalId}/view`);
  };

  const handleEditAppraisal = (appraisalId: string) => {
    navigate(`/appraisals/${appraisalId}/edit`);
  };

  const handleReviewAppraisal = (appraisalId: string) => {
    navigate(`/appraisals/${appraisalId}/review`);
  };

  const handleDeleteAppraisal = (appraisalId: string, employeeName: string) => {
    console.log('Frontend: Attempting to delete appraisal with ID:', appraisalId);
    if (window.confirm(`Are you sure you want to delete the appraisal for ${employeeName}? This action cannot be undone.`)) {
      deleteAppraisalMutation.mutate(appraisalId);
    }
  };

  const getProgressFromStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DRAFT':
        return 25;
      case 'SUBMITTED':
      case 'PENDING_MANAGER_REVIEW':
        return 50;
      case 'PENDING_DIVISIONAL_REVIEW':
        return 75;
      case 'COMPLETED':
        return 100;
      default:
        return 0;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      IN_REVIEW: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`;
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8 sticky top-0 bg-gray-50 z-30 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appraisals</h1>
              <p className="mt-2 text-gray-600">Manage performance appraisals and reviews</p>
            </div>
            <Link
              to="/appraisals/new"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Create New Appraisal
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appraisals List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading appraisals...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">Error loading appraisals: {error.message}</div>
              ) : filteredAppraisals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {statusFilter === 'ALL' ? 'No appraisals found' : `No ${statusFilter.toLowerCase()} appraisals found`}
                </div>
              ) : (
                filteredAppraisals.map((appraisal) => (
                  <div key={appraisal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">
                            {(appraisal.employee?.user?.firstName || appraisal.employee?.firstName || 'E')[0]}{(appraisal.employee?.user?.lastName || appraisal.employee?.lastName || 'M')[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {appraisal.employee?.user?.firstName || appraisal.employee?.firstName} {appraisal.employee?.user?.lastName || appraisal.employee?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{appraisal.template?.name || 'Performance Review'} • {appraisal.cycle?.name || 'Current Cycle'}</p>
                          <p className="text-xs text-gray-400">Created: {new Date(appraisal.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Progress</div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${getProgressFromStatus(appraisal.status)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{getProgressFromStatus(appraisal.status)}%</div>
                      </div>
                      
                      <span className={getStatusBadge(appraisal.status)}>
                        {appraisal.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAppraisal(appraisal.id);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          View
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAppraisal(appraisal.id);
                          }}
                          className="text-sm text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50"
                        >
                          Edit
                        </button>
                        {appraisal.status === 'IN_REVIEW' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewAppraisal(appraisal.id);
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700 px-2 py-1 rounded hover:bg-purple-50"
                          >
                            Review
                          </button>
                        )}
                        {user?.role === 'HR_ADMIN' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const employeeName = `${appraisal.employee?.user?.firstName || appraisal.employee?.firstName || ''} ${appraisal.employee?.user?.lastName || appraisal.employee?.lastName || ''}`;
                              handleDeleteAppraisal(appraisal.id, employeeName);
                            }}
                            className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                            disabled={deleteAppraisalMutation.isPending}
                          >
                            {deleteAppraisalMutation.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
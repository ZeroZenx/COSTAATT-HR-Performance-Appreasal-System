import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  FileText, 
  Clock,
  Activity,
  Settings,
  Download,
  Upload,
  Trash2,
  Eye
} from 'lucide-react';

export function IntegrationPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const queryClient = useQueryClient();

  // Fetch real system statistics
  const { data: systemStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/admin/system-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch system stats');
      return response.json();
    }
  });

  // Fetch database connection status
  const { data: dbStatus, isLoading: dbLoading } = useQuery({
    queryKey: ['db-status'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/admin/test-connection/database', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  // Refresh data mutation
  const refreshMutation = useMutation({
    mutationFn: async (type: string) => {
      setIsRefreshing(true);
      const response = await fetch(`http://10.2.1.27:3000/admin/refresh-${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`Failed to refresh ${type}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      queryClient.invalidateQueries({ queryKey: ['db-status'] });
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    }
  });

  const handleRefresh = (type: string) => {
    refreshMutation.mutate(type);
  };

  const handleTestConnection = async () => {
    try {
      const response = await fetch('http://10.2.1.27:3000/admin/test-connection/database', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      alert(result.success ? 'Database connection successful!' : 'Database connection failed!');
    } catch (error) {
      alert('Database connection test failed!');
    }
  };

  const handleExportData = async (type: string) => {
    try {
      const response = await fetch(`http://10.2.1.27:3000/admin/export-${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      alert(`Failed to export ${type} data`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ERROR':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Layout>
      <Header />
      <div className="p-6 max-w-full overflow-x-hidden -ml-40">
        {/* Page Header */}
        <div className="mb-8 sticky top-20 bg-white z-30 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Database Integration</h1>
              <p className="mt-2 text-gray-600">Manage database connections and synchronize employee data</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTestConnection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Test Connection
              </button>
              <button
                onClick={() => handleRefresh('all')}
                disabled={isRefreshing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Full Sync
              </button>
              <button
                onClick={() => handleExportData('all')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database Status</p>
                <div className="flex items-center mt-2">
                  {getStatusIcon(dbStatus?.success ? 'success' : 'error')}
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(dbStatus?.success ? 'success' : 'error')}`}>
                    {dbStatus?.success ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <Database className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statsLoading ? '...' : systemStats?.totalEmployees || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appraisals</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statsLoading ? '...' : systemStats?.totalAppraisals || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Sync</p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date().toLocaleString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Common database management tasks</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleRefresh('employees')}
                disabled={isRefreshing}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Users className="w-5 h-5 text-blue-500 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Refresh Employees</div>
                  <div className="text-sm text-gray-500">Sync employee data</div>
                </div>
              </button>

              <button
                onClick={() => handleRefresh('appraisals')}
                disabled={isRefreshing}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FileText className="w-5 h-5 text-green-500 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Refresh Appraisals</div>
                  <div className="text-sm text-gray-500">Sync appraisal data</div>
                </div>
              </button>

              <button
                onClick={() => handleRefresh('templates')}
                disabled={isRefreshing}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Settings className="w-5 h-5 text-purple-500 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Refresh Templates</div>
                  <div className="text-sm text-gray-500">Sync template data</div>
                </div>
              </button>

              <button
                onClick={() => handleExportData('employees')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-5 h-5 text-orange-500 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Export Employees</div>
                  <div className="text-sm text-gray-500">Download CSV file</div>
                </div>
              </button>

              <button
                onClick={() => handleExportData('appraisals')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-5 h-5 text-orange-500 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Export Appraisals</div>
                  <div className="text-sm text-gray-500">Download CSV file</div>
                </div>
              </button>

              <button
                onClick={() => handleExportData('reports')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-5 h-5 text-orange-500 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Export Reports</div>
                  <div className="text-sm text-gray-500">Download CSV file</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        {systemStats && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Statistics</h3>
              <p className="text-sm text-gray-600">Current system metrics and data counts</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{systemStats.totalUsers || 0}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{systemStats.totalAppraisals || 0}</div>
                  <div className="text-sm text-gray-500">Total Appraisals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{systemStats.totalTemplates || 0}</div>
                  <div className="text-sm text-gray-500">Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{systemStats.totalCompetencies || 0}</div>
                  <div className="text-sm text-gray-500">Competencies</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Database Information</h3>
            <p className="text-sm text-gray-600">Connection details and system information</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Connection Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database Type:</span>
                    <span className="text-sm font-medium">PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Host:</span>
                    <span className="text-sm font-medium">localhost:5432</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database:</span>
                    <span className="text-sm font-medium">costaatt_hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${dbStatus?.success ? 'text-green-600' : 'text-red-600'}`}>
                      {dbStatus?.success ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-4">System Health</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime:</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time:</span>
                    <span className="text-sm font-medium">2.3ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Backup:</span>
                    <span className="text-sm font-medium">Today 06:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next Backup:</span>
                    <span className="text-sm font-medium">Tomorrow 06:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
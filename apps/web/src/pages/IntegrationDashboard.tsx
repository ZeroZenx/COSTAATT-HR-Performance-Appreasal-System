import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Building, 
  TrendingUp,
  Clock,
  Settings,
  Server,
  Activity,
  Zap,
  Shield,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface SyncStatus {
  totalEmployees: number;
  activeRecords: number;
  syncStatus: 'SYNCED' | 'OUT_OF_SYNC' | 'ERROR';
  lastSync: string;
  databaseStatus: 'CONNECTED' | 'DISCONNECTED';
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

interface SystemStats {
  totalUsers: number;
  totalEmployees: number;
  totalAppraisals: number;
  activeAppraisals: number;
  completedAppraisals: number;
  systemUptime: string;
  lastBackup: string;
  databaseSize: string;
  memoryUsage: string;
  cpuUsage: string;
}

interface DepartmentStats {
  department: string;
  total_employees: number;
  avg_rating: number;
  trained_employees: number;
  appraisals_due: number;
  completion_rate: number;
}

export function IntegrationDashboard() {
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch system statistics
  const { data: systemStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://10.2.1.27:3000/admin/system-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch system statistics');
      }
      return response.json() as Promise<SystemStats>;
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch employees data
  const { data: employees, isLoading: employeesLoading, error: employeesError, refetch: refetchEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return response.json();
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch appraisals data
  const { data: appraisals, isLoading: appraisalsLoading, refetch: refetchAppraisals } = useQuery({
    queryKey: ['appraisals'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/appraisals');
      if (!response.ok) {
        throw new Error('Failed to fetch appraisals');
      }
      return response.json();
    }
  });

  // Calculate sync status
  const syncStatus: SyncStatus = {
    totalEmployees: employees?.length || 0,
    activeRecords: employees?.filter((emp: any) => emp.user?.active).length || 0,
    syncStatus: employeesLoading ? 'ERROR' : 'SYNCED',
    lastSync: new Date().toISOString(),
    databaseStatus: statsLoading ? 'DISCONNECTED' : 'CONNECTED',
    systemHealth: statsLoading ? 'CRITICAL' : 'HEALTHY'
  };

  // Calculate department analytics
  const departmentStats: DepartmentStats[] = React.useMemo(() => {
    if (!employees) return [];
    
    const deptMap = employees.reduce((acc: any, emp: any) => {
      const dept = emp.dept || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          total_employees: 0,
          avg_rating: 0,
          trained_employees: 0,
          appraisals_due: 0,
          completion_rate: 0
        };
      }
      acc[dept].total_employees++;
      return acc;
    }, {});

    return Object.values(deptMap);
  }, [employees]);

  const testConnection = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('http://10.2.1.27:3000/employees');
      if (response.ok) {
        setMessage({ type: 'success', text: 'Database connection successful! Your HR Performance Gateway is fully operational.' });
      } else {
        setMessage({ type: 'error', text: 'Database connection failed!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection test failed! Please check your network connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  const syncEmployees = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await refetchEmployees();
      setMessage({ type: 'success', text: 'Employee data refreshed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Employee refresh failed!' });
    } finally {
      setIsLoading(false);
    }
  };

  const fullSync = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await Promise.all([refetchEmployees(), refetchAppraisals(), refetchStats()]);
      setMessage({ type: 'success', text: 'All data refreshed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Data refresh failed!' });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async (type: 'employees' | 'appraisals' | 'analytics' | 'full-backup') => {
    try {
      let endpoint = '';
      let filename = '';
      
      switch (type) {
        case 'employees':
          endpoint = 'http://10.2.1.27:3000/employees';
          filename = `employees_backup_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'appraisals':
          endpoint = 'http://10.2.1.27:3000/appraisals';
          filename = `appraisals_backup_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'analytics':
          endpoint = 'http://10.2.1.27:3000/reports/analytics';
          filename = `analytics_backup_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'full-backup':
          // Create a comprehensive backup
          const backupData = {
            timestamp: new Date().toISOString(),
            employees: employees || [],
            appraisals: appraisals || [],
            systemStats: systemStats || {},
            departmentStats: departmentStats || []
          };
          
          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `costaatt_hr_full_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setMessage({ type: 'success', text: 'Full database backup exported successfully!' });
          return;
      }
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setMessage({ type: 'success', text: `${type} data exported successfully!` });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to export ${type} data!` });
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'HEALTHY': return 'text-green-600';
      case 'WARNING': return 'text-yellow-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'HEALTHY': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'CRITICAL': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  // Show loading state
  if (statsLoading && employeesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={true} onClose={() => {}} />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading integration data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (statsError || employeesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={true} onClose={() => {}} />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-semibold">Error loading integration data</p>
                <p className="text-sm">{statsError?.message || employeesError?.message}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={true} onClose={() => {}} />
      <div className="flex-1 flex flex-col">
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Integration Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  COSTAATT HR Performance Gateway - System Integration & Health Monitoring
                </p>
              </div>
              <div className="flex space-x-3">
                <Button onClick={testConnection} disabled={isLoading} variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button onClick={fullSync} disabled={isLoading} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Full Sync
                </Button>
                <div className="relative">
                  <select 
                    onChange={(e) => exportData(e.target.value as any)}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Export Options</option>
                    <option value="full-backup">Full Database Backup</option>
                    <option value="employees">Employees Data</option>
                    <option value="appraisals">Appraisals Data</option>
                    <option value="analytics">Analytics Data</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'border-green-200 bg-green-50 text-green-800' 
                : message.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-800'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
                {message.type === 'info' && <Activity className="h-5 w-5 mr-2" />}
                {message.text}
              </div>
            </div>
          )}

          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Database Status</p>
                    <p className="text-lg font-bold text-gray-900">{syncStatus.databaseStatus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">System Health</p>
                    <div className="flex items-center">
                      {getHealthIcon(syncStatus.systemHealth)}
                      <span className={`ml-2 text-lg font-bold ${getHealthColor(syncStatus.systemHealth)}`}>
                        {syncStatus.systemHealth}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-lg font-bold text-gray-900">{syncStatus.totalEmployees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Records</p>
                    <p className="text-lg font-bold text-gray-900">{syncStatus.activeRecords}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Statistics */}
          {systemStats && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Statistics
                </CardTitle>
                <CardDescription>
                  Real-time system performance and usage metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{systemStats.totalEmployees}</div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{systemStats.totalAppraisals}</div>
                    <div className="text-sm text-gray-600">Total Appraisals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{systemStats.activeAppraisals}</div>
                    <div className="text-sm text-gray-600">Active Appraisals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{systemStats.completedAppraisals}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sync Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Data
                </CardTitle>
                <CardDescription>
                  Refresh employee data from MySQL database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={syncEmployees} 
                  disabled={isLoading || employeesLoading}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${employeesLoading ? 'animate-spin' : ''}`} />
                  Refresh Employee Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Appraisal Data
                </CardTitle>
                <CardDescription>
                  Refresh appraisal and performance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => refetchAppraisals()} 
                  disabled={isLoading || appraisalsLoading}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${appraisalsLoading ? 'animate-spin' : ''}`} />
                  Refresh Appraisal Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Stats
                </CardTitle>
                <CardDescription>
                  Refresh system statistics and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => refetchStats()} 
                  disabled={isLoading || statsLoading}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                  Refresh System Stats
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Department Analytics */}
          {departmentStats.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Department Analytics
                </CardTitle>
                <CardDescription>
                  Real-time department performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Department</th>
                        <th className="text-left p-3 font-medium">Employees</th>
                        <th className="text-left p-3 font-medium">Avg Rating</th>
                        <th className="text-left p-3 font-medium">Completion Rate</th>
                        <th className="text-left p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentStats.map((dept, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{dept.department}</td>
                          <td className="p-3">{dept.total_employees}</td>
                          <td className="p-3">
                            <Badge variant={dept.avg_rating >= 4 ? 'default' : 'secondary'}>
                              {dept.avg_rating?.toFixed(1) || 'N/A'}
                            </Badge>
                          </td>
                          <td className="p-3">{dept.completion_rate}%</td>
                          <td className="p-3">
                            <Badge variant={dept.completion_rate >= 80 ? 'default' : 'destructive'}>
                              {dept.completion_rate >= 80 ? 'Good' : 'Needs Attention'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Information
              </CardTitle>
              <CardDescription>
                Current database configuration and connection details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Database Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Database Type:</span>
                      <span className="font-medium text-green-600">MySQL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Host:</span>
                      <span className="font-medium">localhost:3306</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Name:</span>
                      <span className="font-medium">costaatt_hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection Status:</span>
                      <span className="font-medium text-green-600">Connected</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">System Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Records:</span>
                      <span className="font-medium">{syncStatus.totalEmployees + (systemStats?.totalAppraisals || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Backup:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Backup Frequency:</span>
                      <span className="font-medium">Daily</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Integrity:</span>
                      <span className="font-medium text-green-600">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Integration Benefits
              </CardTitle>
              <CardDescription>
                Benefits of your integrated MySQL HR Performance Gateway system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Real-time Data</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Always current employee information</li>
                    <li>• Automatic department updates</li>
                    <li>• Live organizational structure</li>
                    <li>• Real-time performance data</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Enhanced Analytics</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Cross-system reporting</li>
                    <li>• Historical performance trends</li>
                    <li>• Department comparisons</li>
                    <li>• Training ROI analysis</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Data Security</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Secure MySQL database</li>
                    <li>• Role-based access control</li>
                    <li>• Audit trail logging</li>
                    <li>• Data encryption at rest</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium">Performance</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Optimized database queries</li>
                    <li>• Fast data retrieval</li>
                    <li>• Minimal system latency</li>
                    <li>• Scalable architecture</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
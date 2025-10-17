import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { 
  Settings, 
  Database, 
  Bell, 
  Shield, 
  Users, 
  Mail, 
  Key, 
  Globe, 
  Cloud, 
  FileText, 
  BarChart3, 
  Zap,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  HardDrive,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Archive,
  Trash2,
  RotateCcw,
  FolderOpen,
  FileArchive,
  Search,
  User
} from 'lucide-react';

interface Settings {
  // General Settings
  appName?: string;
  appVersion?: string;
  environment?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  currency?: string;
  
  // Database Settings
  dbHost?: string;
  dbPort?: string;
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  dbSsl?: boolean;
  
  // Authentication Settings
  jwtSecret?: string;
  jwtExpiry?: string;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSymbols?: boolean;
  maxLoginAttempts?: number;
  
  // Security Settings
  passwordExpirationDays?: number;
  passwordRequireLowercase?: boolean;
  sessionTimeoutMinutes?: number;
  maxConcurrentSessions?: number;
  requireReauthOnSensitiveActions?: boolean;
  lockoutDurationMinutes?: number;
  enableIpWhitelist?: boolean;
  allowedIpAddresses?: string;
  twoFactorEnabled?: boolean;
  twoFactorRequiredForAdmin?: boolean;
  twoFactorMethod?: string;
  twoFactorBackupCodes?: number;
  enableSecurityLogging?: boolean;
  logLoginAttempts?: boolean;
  logPasswordChanges?: boolean;
  logPermissionChanges?: boolean;
  logDataExports?: boolean;
  logRetentionDays?: number;
  enableDataEncryption?: boolean;
  enableDataAnonymization?: boolean;
  dataRetentionYears?: number;
  
  // SSO Settings
  ssoEnabled?: boolean;
  microsoftClientId?: string;
  microsoftClientSecret?: string;
  microsoftTenantId?: string;
  ssoRedirectUrl?: string;
  
  // Email Settings
  emailEnabled?: boolean;
  emailProvider?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  fromEmail?: string;
  fromName?: string;
  
  // Notification Settings
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  appraisalReminders?: boolean;
  deadlineAlerts?: boolean;
  managerNotifications?: boolean;
  hrNotifications?: boolean;
  reminderFrequency?: string;
  
  // Feature Flags
  selfAppraisalEnabled?: boolean;
  managerReviewEnabled?: boolean;
  hrReviewEnabled?: boolean;
  peerReviewEnabled?: boolean;
  goalSettingEnabled?: boolean;
  competencyManagementEnabled?: boolean;
  reportGenerationEnabled?: boolean;
  bulkOperationsEnabled?: boolean;
  advancedAnalyticsEnabled?: boolean;
  mobileAppEnabled?: boolean;
  apiAccessEnabled?: boolean;
  webhookEnabled?: boolean;
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    return tabFromUrl || 'general';
  });
  
  // Wrapper function to update both state and URL
  const setActiveTab = (tabId: string) => {
    setActiveTabState(tabId);
    setSearchParams({ tab: tabId });
  };
  
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<Settings>({});
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'restoring' | 'success' | 'error'>('idle');
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupFiles, setBackupFiles] = useState<any[]>([]);
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  
  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'EMPLOYEE',
    roles: ['EMPLOYEE'],
    dept: '',
    title: '',
    active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch system stats
  const { data: systemStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/admin/system-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch system stats');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3
  });

  // Fetch settings
  const { data: fetchedSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const result = await response.json();
      return result.data;
    }
  });

  // Update local settings when fetched settings change
  React.useEffect(() => {
    if (fetchedSettings) {
      console.log('Loaded settings from backend:', {
        emailEnabled: fetchedSettings.emailEnabled,
        emailProvider: fetchedSettings.emailProvider,
        smtpHost: fetchedSettings.smtpHost,
        fromEmail: fetchedSettings.fromEmail,
        ssoEnabled: fetchedSettings.ssoEnabled,
        // Don't log sensitive data
      });
      setSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  // Fetch users when users tab is active
  React.useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Also fetch users on component mount if user is admin
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'HR_ADMIN' || user.roles?.includes('HR_ADMIN')) {
      fetchUsers();
    }
  }, []);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      console.log('Sending settings to backend:', {
        emailEnabled: newSettings.emailEnabled,
        emailProvider: newSettings.emailProvider,
        smtpHost: newSettings.smtpHost,
        fromEmail: newSettings.fromEmail,
        ssoEnabled: newSettings.ssoEnabled,
        // Don't log sensitive data
      });
      
      const response = await fetch('http://10.2.1.27:3000/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSettings)
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
      setTimeout(() => setMessage(null), 5000);
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await fetch(`http://10.2.1.27:3000/admin/test-connection/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: type === 'sso' ? JSON.stringify({
          microsoftClientId: settings.microsoftClientId,
          microsoftTenantId: settings.microsoftTenantId
        }) : undefined
      });
      if (!response.ok) throw new Error('Failed to test connection');
      return response.json();
    },
    onSuccess: (data: any) => {
      setMessage({ 
        type: data.success ? 'success' : 'error', 
        text: data.message || 'Connection test completed' 
      });
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.message || 'Connection test failed' });
      setTimeout(() => setMessage(null), 5000);
    }
  });

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Backup operation functions
  const handleCreateBackup = async (backupType: 'full' | 'database' | 'files') => {
    setBackupStatus('backing_up');
    setBackupProgress(0);
    
    try {
      const response = await fetch('http://10.2.1.27:3000/admin/backup/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: backupType })
      });
      
      if (response.ok) {
        const result = await response.json();
        setBackupStatus('success');
        setMessage({ type: 'success', text: `Backup created successfully: ${result.filename}` });
        fetchBackupFiles(); // Refresh backup files list
      } else {
        throw new Error('Backup creation failed');
      }
    } catch (error) {
      setBackupStatus('error');
      setMessage({ type: 'error', text: 'Failed to create backup' });
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    setBackupStatus('restoring');
    setBackupProgress(0);
    
    try {
      const response = await fetch(`http://10.2.1.27:3000/admin/backup/restore/${backupId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setBackupStatus('success');
        setMessage({ type: 'success', text: 'Backup restored successfully' });
        fetchBackupFiles(); // Refresh backup files list
      } else {
        throw new Error('Backup restore failed');
      }
    } catch (error) {
      setBackupStatus('error');
      setMessage({ type: 'error', text: 'Failed to restore backup' });
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`http://10.2.1.27:3000/admin/backup/delete/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Backup deleted successfully' });
        fetchBackupFiles(); // Refresh backup files list
      } else {
        throw new Error('Backup deletion failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete backup' });
    }
  };

  const fetchBackupFiles = async () => {
    try {
      const response = await fetch('http://10.2.1.27:3000/admin/backup/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setBackupFiles(result.files || []);
      }
    } catch (error) {
      console.error('Error fetching backup files:', error);
    }
  };

  const fetchBackupLogs = async () => {
    try {
      const response = await fetch('http://10.2.1.27:3000/admin/backup/logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setBackupLogs(result.logs || []);
      }
    } catch (error) {
      console.error('Error fetching backup logs:', error);
    }
  };

  const downloadBackup = async (backupId: string, filename: string) => {
    try {
      const response = await fetch(`http://10.2.1.27:3000/admin/backup/download/${backupId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ type: 'success', text: 'Backup downloaded successfully' });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download backup' });
    }
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleTestConnection = (type: string) => {
    testConnectionMutation.mutate(type);
  };

  // Database operation functions
  const handleRefreshData = async (type: string) => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`http://10.2.1.27:3000/admin/refresh-${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: `${type} data refreshed successfully!` });
        queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      } else {
        setMessage({ type: 'error', text: `Failed to refresh ${type} data` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error refreshing ${type} data` });
    } finally {
      setIsRefreshing(false);
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
        setMessage({ type: 'success', text: `${type} data exported successfully!` });
      } else {
        setMessage({ type: 'error', text: `Failed to export ${type} data` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error exporting ${type} data` });
    }
  };

  const handleTestDatabaseConnection = async () => {
    setDbConnectionStatus('testing');
    try {
      const response = await fetch('http://10.2.1.27:3000/admin/test-connection/database', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setDbConnectionStatus('connected');
        setMessage({ type: 'success', text: 'Database connection successful!' });
      } else {
        setDbConnectionStatus('disconnected');
        setMessage({ type: 'error', text: 'Database connection failed!' });
      }
    } catch (error) {
      setDbConnectionStatus('disconnected');
      setMessage({ type: 'error', text: 'Database connection test failed!' });
    }
  };

  // Email operation functions
  const handleTestEmail = async () => {
    setEmailTestResult(null);
    try {
      const response = await fetch('http://10.2.1.27:3000/admin/test-connection/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      setEmailTestResult({
        success: result.success,
        message: result.message || (result.success ? 'Email test successful!' : 'Email test failed!')
      });
    } catch (error) {
      setEmailTestResult({
        success: false,
        message: 'Email test failed!'
      });
    }
  };

  const fetchEmailLogs = async () => {
    setEmailLogsLoading(true);
    try {
      const response = await fetch('http://10.2.1.27:3000/admin/email-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setEmailLogs(result.data?.logs || []);
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setEmailLogsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // User management functions
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('http://10.2.1.27:3000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Users API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Users API response data:', result);
        setUsers(result.data || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch users:', response.status, errorData);
        setMessage({ type: 'error', text: `Failed to fetch users: ${errorData.message || response.statusText}` });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to fetch users. Please check your connection.' });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch('http://10.2.1.27:3000/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userFormData)
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'User created successfully!' });
        setShowUserModal(false);
        setUserFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'EMPLOYEE',
          roles: ['EMPLOYEE'],
          dept: '',
          title: '',
          active: true
        });
        fetchUsers();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create user' });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`http://10.2.1.27:3000/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userFormData)
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        setShowUserModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to update user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://10.2.1.27:3000/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        fetchUsers();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to delete user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setUserFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'EMPLOYEE',
      roles: user.roles || ['EMPLOYEE'],
      dept: user.dept || '',
      title: user.title || '',
      active: user.active !== false
    });
    setShowUserModal(true);
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setUserFormData(prev => ({
        ...prev,
        roles: [...prev.roles, role]
      }));
    } else {
      setUserFormData(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r !== role)
      }));
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = !searchTerm || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.dept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || 
      user.role === roleFilter || 
      user.roles?.includes(roleFilter);

    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'inactive' && !user.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Please select users first' });
      return;
    }

    try {
      const promises = selectedUsers.map(userId => {
        switch (action) {
          case 'activate':
            return fetch(`http://10.2.1.27:3000/admin/users/${userId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ active: true })
            });
          case 'deactivate':
            return fetch(`http://10.2.1.27:3000/admin/users/${userId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ active: false })
            });
          case 'delete':
            return fetch(`http://10.2.1.27:3000/admin/users/${userId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setMessage({ type: 'success', text: `Bulk ${action} completed successfully!` });
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to perform bulk ${action}` });
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'auth', name: 'Authentication', icon: Shield },
    { id: 'sso', name: 'SSO', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Key },
    { id: 'performance', name: 'Performance', icon: Zap },
    { id: 'integrations', name: 'Integrations', icon: Cloud },
    { id: 'backup', name: 'Backup', icon: FileText },
    { id: 'monitoring', name: 'Monitoring', icon: BarChart3 },
    { id: 'features', name: 'Feature Flags', icon: Users }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-8 sticky top-0 bg-gray-50 z-30 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="mt-2 text-gray-600">Configure and manage all system settings</p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setMessage(null)}
                    className={`inline-flex rounded-md p-1.5 ${
                      message.type === 'success' 
                        ? 'text-green-500 hover:bg-green-100' 
                        : 'text-red-500 hover:bg-red-100'
                    }`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Stats Overview */}
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statsLoading ? '...' : statsError ? 'Error' : systemStats?.totalUsers || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Appraisals</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statsLoading ? '...' : statsError ? 'Error' : systemStats?.activeAppraisals || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Server className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">System Uptime</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statsLoading ? '...' : statsError ? 'Error' : systemStats?.systemUptime || '0h 0m'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <HardDrive className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Database Size</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statsLoading ? '...' : statsError ? 'Error' : systemStats?.databaseSize || '0 MB'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Settings Categories</h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {tab.name}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {tabs.find(tab => tab.id === activeTab)?.name} Settings
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveSettingsMutation.isPending}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Loading State */}
                  {settingsLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading settings...</p>
                    </div>
                  )}

                  {/* Settings Content */}
                  {!settingsLoading && Object.keys(settings).length > 0 && (
                    <>
                      {/* General Settings */}
                      {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Application Name
                          </label>
                          <input
                            type="text"
                            value={settings.appName}
                            onChange={(e) => setSettings({...settings, appName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Version
                          </label>
                          <input
                            type="text"
                            value={settings.appVersion}
                            onChange={(e) => setSettings({...settings, appVersion: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Environment
                          </label>
                          <select
                            value={settings.environment}
                            onChange={(e) => setSettings({...settings, environment: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="development">Development</option>
                            <option value="staging">Staging</option>
                            <option value="production">Production</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                          </label>
                          <select
                            value={settings.timezone}
                            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="America/Port_of_Spain">America/Port_of_Spain</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <select
                            value={settings.language}
                            onChange={(e) => setSettings({...settings, language: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                          </label>
                          <select
                            value={settings.currency}
                            onChange={(e) => setSettings({...settings, currency: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="TTD">TTD</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Users Management */}
                  {activeTab === 'users' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                          <p className="text-sm text-gray-600">Manage system users, roles, and permissions</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={fetchUsers}
                            disabled={usersLoading}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                            Refresh
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(null);
                              setUserFormData({
                                firstName: '',
                                lastName: '',
                                email: '',
                                role: 'EMPLOYEE',
                                roles: ['EMPLOYEE'],
                                dept: '',
                                title: '',
                                active: true
                              });
                              setShowUserModal(true);
                            }}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Add User
                          </button>
                        </div>
                      </div>

                      {/* User Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Total Users</p>
                              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Active Users</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.active).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Admins</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'HR_ADMIN' || u.roles?.includes('HR_ADMIN')).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <User className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Employees</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'EMPLOYEE' || u.roles?.includes('EMPLOYEE')).length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Search and Filters */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search by name, email, department..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                          <div className="sm:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              value={roleFilter}
                              onChange={(e) => setRoleFilter(e.target.value)}
                            >
                              <option value="">All Roles</option>
                              <option value="HR_ADMIN">HR Admin</option>
                              <option value="SUPERVISOR">Supervisor</option>
                              <option value="EMPLOYEE">Employee</option>
                              <option value="EXECUTIVE">Executive</option>
                              <option value="FINAL_APPROVER">Final Approver</option>
                            </select>
                          </div>
                          <div className="sm:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                            >
                              <option value="">All Status</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Users Table */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-900">
                              Users ({filteredUsers.length} of {users.length})
                            </h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowBulkActions(!showBulkActions)}
                                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                              >
                                <Settings className="w-4 h-4" />
                                Bulk Actions
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bulk Actions */}
                        {showBulkActions && (
                          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                  {selectedUsers.length} user(s) selected
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleBulkAction('activate')}
                                    disabled={selectedUsers.length === 0}
                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                                  >
                                    Activate
                                  </button>
                                  <button
                                    onClick={() => handleBulkAction('deactivate')}
                                    disabled={selectedUsers.length === 0}
                                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
                                  >
                                    Deactivate
                                  </button>
                                  <button
                                    onClick={() => handleBulkAction('delete')}
                                    disabled={selectedUsers.length === 0}
                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedUsers([])}
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                Clear Selection
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {usersLoading ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-600">Loading users...</p>
                          </div>
                        ) : users.length === 0 ? (
                          <div className="p-8 text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-4">
                              {message?.type === 'error' ? 'Failed to load users. Please try refreshing.' : 'No users have been created yet.'}
                            </p>
                            <button
                              onClick={fetchUsers}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                            >
                              Refresh Users
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                      type="checkbox"
                                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                      onChange={(e) => handleSelectAll(e.target.checked)}
                                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                  <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                          <span className="text-sm font-medium text-purple-600">
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                          </span>
                                        </div>
                                        <div className="ml-3">
                                          <div className="text-sm font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                          </div>
                                          <div className="text-sm text-gray-500">{user.title}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {user.dept}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex flex-wrap gap-1">
                                        {(user.roles || [user.role]).map((role: string) => (
                                          <span
                                            key={role}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                          >
                                            {role}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {user.active ? 'Active' : 'Inactive'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleEditUser(user)}
                                          className="text-purple-600 hover:text-purple-900"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Database Settings */}
                  {activeTab === 'database' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Database Host
                          </label>
                          <input
                            type="text"
                            value={settings.dbHost}
                            onChange={(e) => setSettings({...settings, dbHost: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Database Port
                          </label>
                          <input
                            type="text"
                            value={settings.dbPort}
                            onChange={(e) => setSettings({...settings, dbPort: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Database Name
                          </label>
                          <input
                            type="text"
                            value={settings.dbName}
                            onChange={(e) => setSettings({...settings, dbName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Database User
                          </label>
                          <input
                            type="text"
                            value={settings.dbUser}
                            onChange={(e) => setSettings({...settings, dbUser: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Database Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.dbPassword ? 'text' : 'password'}
                              value={settings.dbPassword}
                              onChange={(e) => setSettings({...settings, dbPassword: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('dbPassword')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.dbPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.dbSsl}
                            onChange={(e) => setSettings({...settings, dbSsl: e.target.checked})}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            Enable SSL
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Connection Status: <span className="text-green-600 font-medium">Connected</span>
                        </div>
                        <button
                          onClick={() => handleTestConnection('database')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Test Connection
                        </button>
                      </div>

                      {/* Database Integration Features */}
                      <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Integration</h3>
                        
                        {/* Connection Status */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-3 ${
                                dbConnectionStatus === 'connected' ? 'bg-green-500' : 
                                dbConnectionStatus === 'testing' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  Database Status: 
                                  <span className={`ml-2 ${
                                    dbConnectionStatus === 'connected' ? 'text-green-600' : 
                                    dbConnectionStatus === 'testing' ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {dbConnectionStatus === 'connected' ? 'Connected' : 
                                     dbConnectionStatus === 'testing' ? 'Testing...' : 'Disconnected'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {dbConnectionStatus === 'connected' ? 'Database is accessible and ready' : 
                                   dbConnectionStatus === 'testing' ? 'Testing connection...' : 'Database connection failed'}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={handleTestDatabaseConnection}
                              disabled={dbConnectionStatus === 'testing'}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                              <Database className="w-4 h-4 mr-2" />
                              {dbConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <button
                            onClick={() => handleRefreshData('employees')}
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
                            onClick={() => handleRefreshData('appraisals')}
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
                            onClick={() => handleRefreshData('templates')}
                            disabled={isRefreshing}
                            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Settings className="w-5 h-5 text-purple-500 mr-3" />
                            <div className="text-left">
                              <div className="font-medium">Refresh Templates</div>
                              <div className="text-sm text-gray-500">Sync template data</div>
                            </div>
                          </button>
                        </div>

                        {/* Export Buttons */}
                        <div className="border-t pt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-3">Export Data</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <button
                              onClick={() => handleExportData('employees')}
                              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4 text-orange-500 mr-2" />
                              <span className="text-sm font-medium">Employees</span>
                            </button>

                            <button
                              onClick={() => handleExportData('appraisals')}
                              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4 text-orange-500 mr-2" />
                              <span className="text-sm font-medium">Appraisals</span>
                            </button>

                            <button
                              onClick={() => handleExportData('users')}
                              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4 text-orange-500 mr-2" />
                              <span className="text-sm font-medium">Users</span>
                            </button>

                            <button
                              onClick={() => handleExportData('reports')}
                              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4 text-orange-500 mr-2" />
                              <span className="text-sm font-medium">Reports</span>
                            </button>
                          </div>
                        </div>

                        {/* System Statistics */}
                        {systemStats && (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="text-md font-medium text-gray-900 mb-3">System Statistics</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers || 0}</div>
                                <div className="text-sm text-gray-500">Total Users</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{systemStats.totalAppraisals || 0}</div>
                                <div className="text-sm text-gray-500">Appraisals</div>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{systemStats.totalTemplates || 0}</div>
                                <div className="text-sm text-gray-500">Templates</div>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{systemStats.totalCompetencies || 0}</div>
                                <div className="text-sm text-gray-500">Competencies</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Authentication Settings */}
                  {activeTab === 'auth' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            JWT Secret
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.jwtSecret ? 'text' : 'password'}
                              value={settings.jwtSecret}
                              onChange={(e) => setSettings({...settings, jwtSecret: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('jwtSecret')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.jwtSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            JWT Expiry
                          </label>
                          <select
                            value={settings.jwtExpiry}
                            onChange={(e) => setSettings({...settings, jwtExpiry: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="1h">1 Hour</option>
                            <option value="24h">24 Hours</option>
                            <option value="7d">7 Days</option>
                            <option value="30d">30 Days</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Password Length
                          </label>
                          <input
                            type="number"
                            value={settings.passwordMinLength}
                            onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Login Attempts
                          </label>
                          <input
                            type="number"
                            value={settings.maxLoginAttempts}
                            onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Password Requirements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.passwordRequireUppercase}
                              onChange={(e) => setSettings({...settings, passwordRequireUppercase: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Require Uppercase Letters
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.passwordRequireNumbers}
                              onChange={(e) => setSettings({...settings, passwordRequireNumbers: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Require Numbers
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.passwordRequireSymbols}
                              onChange={(e) => setSettings({...settings, passwordRequireSymbols: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Require Symbols
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SSO Settings */}
                  {activeTab === 'sso' && (
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.ssoEnabled}
                          onChange={(e) => setSettings({...settings, ssoEnabled: e.target.checked})}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Enable Single Sign-On (SSO)
                        </label>
                      </div>
                      
                      {settings.ssoEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Microsoft Client ID
                            </label>
                            <input
                              type="text"
                              value={settings.microsoftClientId}
                              onChange={(e) => setSettings({...settings, microsoftClientId: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Microsoft Client Secret
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.microsoftClientSecret ? 'text' : 'password'}
                                value={settings.microsoftClientSecret}
                                onChange={(e) => setSettings({...settings, microsoftClientSecret: e.target.value})}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('microsoftClientSecret')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.microsoftClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Microsoft Tenant ID
                            </label>
                            <input
                              type="text"
                              value={settings.microsoftTenantId}
                              onChange={(e) => setSettings({...settings, microsoftTenantId: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SSO Redirect URL
                            </label>
                            <input
                              type="text"
                              value={settings.ssoRedirectUrl}
                              onChange={(e) => setSettings({...settings, ssoRedirectUrl: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          SSO Status: <span className={`font-medium ${settings.ssoEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                            {settings.ssoEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => saveSettingsMutation.mutate(settings)}
                            disabled={saveSettingsMutation.isPending}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saveSettingsMutation.isPending ? 'Saving...' : 'Save SSO Settings'}
                          </button>
                          {settings.ssoEnabled && (
                            <button
                              onClick={() => handleTestConnection('sso')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Test SSO Connection
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Settings & Activity Log */}
                  {activeTab === 'email' && (
                    <div className="space-y-8">
                      {/* Email Configuration */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Mail className="w-5 h-5 mr-2" />
                          Email Configuration
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.emailEnabled}
                              onChange={(e) => setSettings({...settings, emailEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable Email Notifications
                            </label>
                          </div>
                          
                          {settings.emailEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email Provider
                                </label>
                                <select
                                  value={settings.emailProvider}
                                  onChange={(e) => setSettings({...settings, emailProvider: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="microsoft-graph">Microsoft Graph API</option>
                                  <option value="smtp">SMTP</option>
                                  <option value="sendgrid">SendGrid</option>
                                  <option value="ses">AWS SES</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  From Email
                                </label>
                                <input
                                  type="email"
                                  value={settings.fromEmail || 'hr@costaatt.edu.tt'}
                                  onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  SMTP Host
                                </label>
                                <input
                                  type="text"
                                  value={settings.smtpHost}
                                  onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  SMTP Port
                                </label>
                                <input
                                  type="number"
                                  value={settings.smtpPort}
                                  onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  SMTP Username
                                </label>
                                <input
                                  type="text"
                                  value={settings.smtpUser}
                                  onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  SMTP Password
                                </label>
                                <div className="relative">
                                  <input
                                    type={showPasswords.smtpPassword ? 'text' : 'password'}
                                    value={settings.smtpPassword}
                                    onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('smtpPassword')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                  >
                                    {showPasswords.smtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={settings.smtpSecure}
                                  onChange={(e) => setSettings({...settings, smtpSecure: e.target.checked})}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                  Use SSL/TLS
                                </label>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => saveSettingsMutation.mutate(settings)}
                              disabled={saveSettingsMutation.isPending}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {saveSettingsMutation.isPending ? 'Saving...' : 'Save Email Settings'}
                            </button>
                            <button
                              onClick={handleTestEmail}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Test Email
                            </button>
                          </div>
                          
                          {emailTestResult && (
                            <div className={`p-4 rounded-lg ${emailTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                              <div className="flex items-center">
                                {emailTestResult.success ? (
                                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                                )}
                                <span className={`text-sm font-medium ${emailTestResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                  {emailTestResult.message}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email Activity Log */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Email Activity Log
                          </h3>
                          <button
                            onClick={fetchEmailLogs}
                            disabled={emailLogsLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${emailLogsLoading ? 'animate-spin' : ''}`} />
                            {emailLogsLoading ? 'Loading...' : 'Refresh Logs'}
                          </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                          {emailLogs.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Recipient
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Attempt
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {emailLogs.map((log, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.success ? 'success' : 'error')}`}>
                                        {getStatusIcon(log.success ? 'success' : 'error')}
                                        <span className="ml-1">{log.success ? 'Sent' : 'Failed'}</span>
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {log.recipient}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                      {log.subject}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {log.attempt || 1}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center py-8">
                              <Mail className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">No email logs</h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Email activity will appear here once emails are sent.
                              </p>
                              <div className="mt-6">
                                <button
                                  onClick={fetchEmailLogs}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                  Load Email Logs
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notificationsEnabled}
                          onChange={(e) => setSettings({...settings, notificationsEnabled: e.target.checked})}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Enable Notifications
                        </label>
                      </div>
                      
                      {settings.notificationsEnabled && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900">Notification Types</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-900">
                                Email Notifications
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={settings.pushNotifications}
                                onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-900">
                                Push Notifications
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={settings.appraisalReminders}
                                onChange={(e) => setSettings({...settings, appraisalReminders: e.target.checked})}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-900">
                                Appraisal Reminders
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={settings.deadlineAlerts}
                                onChange={(e) => setSettings({...settings, deadlineAlerts: e.target.checked})}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-900">
                                Deadline Alerts
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={settings.managerNotifications}
                                onChange={(e) => setSettings({...settings, managerNotifications: e.target.checked})}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-900">
                                Manager Notifications
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={settings.hrNotifications}
                                onChange={(e) => setSettings({...settings, hrNotifications: e.target.checked})}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-900">
                                HR Notifications
                              </label>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reminder Frequency
                            </label>
                            <select
                              value={settings.reminderFrequency}
                              onChange={(e) => setSettings({...settings, reminderFrequency: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-8">
                      {/* Password Policies */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Shield className="w-5 h-5 mr-2" />
                          Password Policies
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Password Length
                              </label>
                              <input
                                type="number"
                                min="6"
                                max="32"
                                value={settings.passwordMinLength || 8}
                                onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters, maximum 32</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password Expiration (Days)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="365"
                                value={settings.passwordExpirationDays || 90}
                                onChange={(e) => setSettings({...settings, passwordExpirationDays: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">0 = Never expire</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900">Password Complexity Requirements</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={settings.passwordRequireUppercase || false}
                                  onChange={(e) => setSettings({...settings, passwordRequireUppercase: e.target.checked})}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                  Require Uppercase Letters
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={settings.passwordRequireNumbers || false}
                                  onChange={(e) => setSettings({...settings, passwordRequireNumbers: e.target.checked})}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                  Require Numbers
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={settings.passwordRequireSymbols || false}
                                  onChange={(e) => setSettings({...settings, passwordRequireSymbols: e.target.checked})}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                  Require Special Characters
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={settings.passwordRequireLowercase || false}
                                  onChange={(e) => setSettings({...settings, passwordRequireLowercase: e.target.checked})}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                  Require Lowercase Letters
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Session Management */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Session Management
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Session Timeout (Minutes)
                              </label>
                              <input
                                type="number"
                                min="5"
                                max="1440"
                                value={settings.sessionTimeoutMinutes || 30}
                                onChange={(e) => setSettings({...settings, sessionTimeoutMinutes: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">5 minutes to 24 hours</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Concurrent Sessions
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={settings.maxConcurrentSessions || 3}
                                onChange={(e) => setSettings({...settings, maxConcurrentSessions: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">Maximum sessions per user</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.requireReauthOnSensitiveActions || false}
                              onChange={(e) => setSettings({...settings, requireReauthOnSensitiveActions: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Require Re-authentication for Sensitive Actions
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Login Security */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Login Security
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Login Attempts
                              </label>
                              <input
                                type="number"
                                min="3"
                                max="10"
                                value={settings.maxLoginAttempts || 5}
                                onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">Before account lockout</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lockout Duration (Minutes)
                              </label>
                              <input
                                type="number"
                                min="5"
                                max="1440"
                                value={settings.lockoutDurationMinutes || 15}
                                onChange={(e) => setSettings({...settings, lockoutDurationMinutes: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">Account lockout period</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.enableIpWhitelist || false}
                              onChange={(e) => setSettings({...settings, enableIpWhitelist: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable IP Address Whitelist
                            </label>
                          </div>

                          {settings.enableIpWhitelist && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Allowed IP Addresses
                              </label>
                              <textarea
                                value={settings.allowedIpAddresses || ''}
                                onChange={(e) => setSettings({...settings, allowedIpAddresses: e.target.value})}
                                placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;172.16.0.0/12"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">One IP address or CIDR range per line</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Key className="w-5 h-5 mr-2" />
                          Two-Factor Authentication
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.twoFactorEnabled || false}
                              onChange={(e) => setSettings({...settings, twoFactorEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable Two-Factor Authentication
                            </label>
                          </div>

                          {settings.twoFactorEnabled && (
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={settings.twoFactorRequiredForAdmin || false}
                                  onChange={(e) => setSettings({...settings, twoFactorRequiredForAdmin: e.target.checked})}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                  Required for Admin Users
                                </label>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  2FA Method
                                </label>
                                <select
                                  value={settings.twoFactorMethod || 'totp'}
                                  onChange={(e) => setSettings({...settings, twoFactorMethod: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="totp">TOTP (Google Authenticator)</option>
                                  <option value="sms">SMS</option>
                                  <option value="email">Email</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Backup Codes Count
                                </label>
                                <input
                                  type="number"
                                  min="5"
                                  max="20"
                                  value={settings.twoFactorBackupCodes || 10}
                                  onChange={(e) => setSettings({...settings, twoFactorBackupCodes: parseInt(e.target.value)})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Number of backup codes to generate</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Security Monitoring */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          Security Monitoring
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.enableSecurityLogging || false}
                              onChange={(e) => setSettings({...settings, enableSecurityLogging: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable Security Event Logging
                            </label>
                          </div>

                          {settings.enableSecurityLogging && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={settings.logLoginAttempts || false}
                                    onChange={(e) => setSettings({...settings, logLoginAttempts: e.target.checked})}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-2 block text-sm text-gray-900">
                                    Log Login Attempts
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={settings.logPasswordChanges || false}
                                    onChange={(e) => setSettings({...settings, logPasswordChanges: e.target.checked})}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-2 block text-sm text-gray-900">
                                    Log Password Changes
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={settings.logPermissionChanges || false}
                                    onChange={(e) => setSettings({...settings, logPermissionChanges: e.target.checked})}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-2 block text-sm text-gray-900">
                                    Log Permission Changes
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={settings.logDataExports || false}
                                    onChange={(e) => setSettings({...settings, logDataExports: e.target.checked})}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-2 block text-sm text-gray-900">
                                    Log Data Exports
                                  </label>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Log Retention Period (Days)
                                </label>
                                <input
                                  type="number"
                                  min="30"
                                  max="3650"
                                  value={settings.logRetentionDays || 365}
                                  onChange={(e) => setSettings({...settings, logRetentionDays: parseInt(e.target.value)})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">How long to keep security logs</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Data Protection */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Shield className="w-5 h-5 mr-2" />
                          Data Protection
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.enableDataEncryption || false}
                              onChange={(e) => setSettings({...settings, enableDataEncryption: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable Data Encryption at Rest
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.enableDataAnonymization || false}
                              onChange={(e) => setSettings({...settings, enableDataAnonymization: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Enable Data Anonymization for Exports
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Data Retention Period (Years)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={settings.dataRetentionYears || 7}
                              onChange={(e) => setSettings({...settings, dataRetentionYears: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">How long to retain employee data</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feature Flags */}
                  {activeTab === 'features' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Core Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.selfAppraisalEnabled}
                              onChange={(e) => setSettings({...settings, selfAppraisalEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Self Appraisal
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.managerReviewEnabled}
                              onChange={(e) => setSettings({...settings, managerReviewEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Manager Review
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.hrReviewEnabled}
                              onChange={(e) => setSettings({...settings, hrReviewEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              HR Review
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.peerReviewEnabled}
                              onChange={(e) => setSettings({...settings, peerReviewEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Peer Review
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.goalSettingEnabled}
                              onChange={(e) => setSettings({...settings, goalSettingEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Goal Setting
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.competencyManagementEnabled}
                              onChange={(e) => setSettings({...settings, competencyManagementEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Competency Management
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Advanced Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.reportGenerationEnabled}
                              onChange={(e) => setSettings({...settings, reportGenerationEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Report Generation
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.bulkOperationsEnabled}
                              onChange={(e) => setSettings({...settings, bulkOperationsEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Bulk Operations
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.advancedAnalyticsEnabled}
                              onChange={(e) => setSettings({...settings, advancedAnalyticsEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Advanced Analytics
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.mobileAppEnabled}
                              onChange={(e) => setSettings({...settings, mobileAppEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Mobile App
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.apiAccessEnabled}
                              onChange={(e) => setSettings({...settings, apiAccessEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              API Access
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.webhookEnabled}
                              onChange={(e) => setSettings({...settings, webhookEnabled: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              Webhooks
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Backup & Restore Settings */}
                  {activeTab === 'backup' && (
                    <div className="space-y-8">
                      {/* Backup Creation */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Archive className="w-5 h-5 mr-2" />
                          Create Backup
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                              onClick={() => handleCreateBackup('full')}
                              disabled={backupStatus === 'backing_up' || backupStatus === 'restoring'}
                              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="text-center">
                                <FileArchive className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                                <h4 className="font-medium text-gray-900">Full Backup</h4>
                                <p className="text-sm text-gray-500 mt-1">Database + Files + Config</p>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => handleCreateBackup('database')}
                              disabled={backupStatus === 'backing_up' || backupStatus === 'restoring'}
                              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="text-center">
                                <Database className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                <h4 className="font-medium text-gray-900">Database Only</h4>
                                <p className="text-sm text-gray-500 mt-1">User data + Appraisals</p>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => handleCreateBackup('files')}
                              disabled={backupStatus === 'backing_up' || backupStatus === 'restoring'}
                              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="text-center">
                                <FolderOpen className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                                <h4 className="font-medium text-gray-900">Files Only</h4>
                                <p className="text-sm text-gray-500 mt-1">Uploads + Documents</p>
                              </div>
                            </button>
                          </div>
                          
                          {backupStatus === 'backing_up' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <RefreshCw className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
                                <span className="text-blue-800 font-medium">Creating backup...</span>
                              </div>
                              <div className="mt-2 bg-blue-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${backupProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {backupStatus === 'restoring' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <RotateCcw className="w-5 h-5 text-yellow-500 mr-2 animate-spin" />
                                <span className="text-yellow-800 font-medium">Restoring backup...</span>
                              </div>
                              <div className="mt-2 bg-yellow-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${backupProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Backup Files List */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Available Backups
                          </h3>
                          <button
                            onClick={fetchBackupFiles}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                          </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                          {backupFiles.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Filename
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {backupFiles.map((backup, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <div className="flex items-center">
                                        <FileArchive className="w-4 h-4 mr-2 text-gray-400" />
                                        {backup.filename}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        backup.type === 'full' ? 'bg-blue-100 text-blue-800' :
                                        backup.type === 'database' ? 'bg-green-100 text-green-800' :
                                        'bg-purple-100 text-purple-800'
                                      }`}>
                                        {backup.type}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {backup.size}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(backup.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                      <button
                                        onClick={() => downloadBackup(backup.id, backup.filename)}
                                        className="text-blue-600 hover:text-blue-900 flex items-center"
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                      </button>
                                      <button
                                        onClick={() => handleRestoreBackup(backup.id)}
                                        disabled={backupStatus === 'backing_up' || backupStatus === 'restoring'}
                                        className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center"
                                      >
                                        <RotateCcw className="w-4 h-4 mr-1" />
                                        Restore
                                      </button>
                                      <button
                                        onClick={() => handleDeleteBackup(backup.id)}
                                        className="text-red-600 hover:text-red-900 flex items-center"
                                      >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center py-8">
                              <Archive className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">No backups found</h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Create your first backup to get started.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Backup Logs */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Backup Activity Log
                          </h3>
                          <button
                            onClick={fetchBackupLogs}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Logs
                          </button>
                        </div>
                        
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {backupLogs.length > 0 ? (
                            backupLogs.map((log, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                  {log.status === 'success' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : log.status === 'error' ? (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                    <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                  </div>
                                  <p className="text-sm text-gray-600">{log.message}</p>
                                  {log.filename && (
                                    <p className="text-xs text-gray-500 mt-1">File: {log.filename}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <Clock className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">No backup activity yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                      {/* Other tabs would continue with similar implementations... */}
                      {activeTab !== 'general' && activeTab !== 'database' && activeTab !== 'auth' && 
                       activeTab !== 'sso' && activeTab !== 'email' && activeTab !== 'notifications' && 
                       activeTab !== 'backup' && activeTab !== 'features' && (
                        <div className="text-center py-12">
                          <div className="text-gray-500">
                            <Settings className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Settings Coming Soon</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              This section is under development and will be available soon.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Error State */}
                  {!settingsLoading && Object.keys(settings).length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-red-500">
                        <Settings className="mx-auto h-12 w-12 text-red-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to Load Settings</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Unable to load settings. Please refresh the page or contact your administrator.
                        </p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userFormData.firstName}
                      onChange={(e) => setUserFormData({...userFormData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userFormData.lastName}
                      onChange={(e) => setUserFormData({...userFormData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={userFormData.dept}
                      onChange={(e) => setUserFormData({...userFormData, dept: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={userFormData.title}
                      onChange={(e) => setUserFormData({...userFormData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roles
                  </label>
                  <div className="space-y-2">
                    {['HR_ADMIN', 'SUPERVISOR', 'EMPLOYEE', 'EXECUTIVE', 'FINAL_APPROVER'].map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={userFormData.roles.includes(role)}
                          onChange={(e) => handleRoleChange(role, e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userFormData.active}
                    onChange={(e) => setUserFormData({...userFormData, active: e.target.checked})}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active User</label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    {selectedUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
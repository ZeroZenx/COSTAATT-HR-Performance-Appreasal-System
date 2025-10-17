import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Mail, 
  RefreshCw, 
  Eye, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Filter,
  Calendar,
  User,
  Search
} from 'lucide-react';

interface EmailLog {
  id: string;
  to: string;
  cc?: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  type: string;
  error?: string;
  attempt: number;
  createdAt: string;
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

const AdminEmailDashboard: React.FC = () => {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats>({ total: 0, sent: 0, failed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [showRawEmail, setShowRawEmail] = useState(false);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-logs?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setEmailLogs(data.data.logs);
        
        // Calculate stats
        const total = data.data.logs.length;
        const sent = data.data.logs.filter((log: EmailLog) => log.status === 'sent').length;
        const failed = data.data.logs.filter((log: EmailLog) => log.status === 'failed').length;
        const pending = data.data.logs.filter((log: EmailLog) => log.status === 'pending').length;
        
        setStats({ total, sent, failed, pending });
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async (emailId: string) => {
    try {
      const response = await fetch(`/api/resend-email/${emailId}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Email queued for resend');
        fetchEmailLogs(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Error resending email');
    }
  };

  const retryAllFailed = async () => {
    try {
      const response = await fetch('/api/retry-failed-emails', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchEmailLogs(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error retrying failed emails:', error);
      alert('Error retrying failed emails');
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const filteredLogs = emailLogs.filter(log => {
    if (filters.status !== 'all' && log.status !== filters.status) return false;
    if (filters.search && !log.to.toLowerCase().includes(filters.search.toLowerCase()) && 
        !log.subject.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return <Badge variant="default" className="bg-green-100 text-green-800">✅ Sent</Badge>;
      case 'failed': return <Badge variant="destructive">❌ Failed</Badge>;
      case 'pending': return <Badge variant="secondary">⏳ Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-30 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Email Activity Log</h1>
          <p className="text-gray-600">Monitor and manage email delivery status</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchEmailLogs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={retryAllFailed} variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Retry All Failed
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sent">✅ Sent</SelectItem>
                  <SelectItem value="failed">❌ Failed</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by email or subject..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs ({filteredLogs.length})</CardTitle>
          <CardDescription>Recent email delivery attempts and status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading email logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">To</th>
                    <th className="text-left p-3">CC</th>
                    <th className="text-left p-3">Subject</th>
                    <th className="text-left p-3">Attempt</th>
                    <th className="text-left p-3">Sent At</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{log.to}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {log.cc ? (
                          <span className="font-mono text-sm text-gray-600">{log.cc}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{log.subject}</p>
                          {log.error && (
                            <p className="text-xs text-red-600 mt-1 truncate">{log.error}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{log.attempt}/3</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedEmail(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {log.status === 'failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resendEmail(log.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No email logs found matching your filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Details Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Email Details
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmail(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedEmail.status)}
                    {getStatusBadge(selectedEmail.status)}
                  </div>
                </div>
                <div>
                  <Label>Attempt</Label>
                  <p className="mt-1">{selectedEmail.attempt}/3</p>
                </div>
                <div>
                  <Label>To</Label>
                  <p className="mt-1 font-mono text-sm">{selectedEmail.to}</p>
                </div>
                <div>
                  <Label>CC</Label>
                  <p className="mt-1 font-mono text-sm">{selectedEmail.cc || 'None'}</p>
                </div>
                <div className="col-span-2">
                  <Label>Subject</Label>
                  <p className="mt-1">{selectedEmail.subject}</p>
                </div>
                <div className="col-span-2">
                  <Label>Sent At</Label>
                  <p className="mt-1">{new Date(selectedEmail.createdAt).toLocaleString()}</p>
                </div>
                {selectedEmail.error && (
                  <div className="col-span-2">
                    <Label>Error Message</Label>
                    <p className="mt-1 text-red-600 font-mono text-sm bg-red-50 p-2 rounded">
                      {selectedEmail.error}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => setShowRawEmail(!showRawEmail)}
                  variant="outline"
                >
                  {showRawEmail ? 'Hide' : 'View'} Raw Email
                </Button>
                {selectedEmail.status === 'failed' && (
                  <Button
                    onClick={() => {
                      resendEmail(selectedEmail.id);
                      setSelectedEmail(null);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Resend Email
                  </Button>
                )}
              </div>
              
              {showRawEmail && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <Label>Raw Email Content</Label>
                  <pre className="mt-2 text-xs overflow-x-auto">
                    {JSON.stringify(selectedEmail, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default AdminEmailDashboard;

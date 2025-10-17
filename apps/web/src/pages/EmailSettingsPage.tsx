import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader2, Mail, Send, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface EmailLog {
  id: string;
  to: string;
  cc: string | null;
  subject: string;
  status: string;
  type: string;
  error: string | null;
  attempt: number;
  createdAt: string;
}

export function EmailSettingsPage() {
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState({
    to: '',
    subject: 'Test Email from COSTAATT HR Gateway',
    html: '<p>This is a test email to verify the email system is working correctly.</p>',
    cc: ''
  });

  // Fetch email logs
  const { data: emailLogs, isLoading: isLoadingLogs } = useQuery<{ logs: EmailLog[], total: number }>({
    queryKey: ['emailLogs'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/api/email-logs?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch email logs');
      }
      const data = await response.json();
      return data.data;
    }
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async (emailData: typeof testEmail) => {
      const response = await fetch('http://10.2.1.27:3000/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(emailData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send test email');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailLogs'] });
    }
  });

  // Retry failed emails mutation
  const retryFailedEmailsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/api/retry-failed-emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retry emails');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailLogs'] });
    }
  });

  const handleSendTestEmail = () => {
    if (!testEmail.to.trim()) {
      alert('Please enter a recipient email address');
      return;
    }
    sendTestEmailMutation.mutate(testEmail);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-600">Sent</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'notification':
        return <Badge variant="outline">Notification</Badge>;
      case 'test':
        return <Badge variant="outline">Test</Badge>;
      case 'alert':
        return <Badge variant="outline">Alert</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 sticky top-0 bg-white z-30 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
          <p className="mt-2 text-gray-600">Manage email notifications and monitor email delivery</p>
        </div>

        <Tabs defaultValue="test" className="space-y-6">
          <TabsList>
            <TabsTrigger value="test">Test Email</TabsTrigger>
            <TabsTrigger value="logs">Email Logs</TabsTrigger>
            <TabsTrigger value="settings">SMTP Settings</TabsTrigger>
          </TabsList>

          {/* Test Email Tab */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Send Test Email
                </CardTitle>
                <CardDescription>
                  Test the email system configuration and delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="to">Recipient Email *</Label>
                    <Input
                      id="to"
                      type="email"
                      placeholder="recipient@example.com"
                      value={testEmail.to}
                      onChange={(e) => setTestEmail(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cc">CC (Optional)</Label>
                    <Input
                      id="cc"
                      type="email"
                      placeholder="cc@example.com"
                      value={testEmail.cc}
                      onChange={(e) => setTestEmail(prev => ({ ...prev, cc: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={testEmail.subject}
                    onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="html">HTML Content</Label>
                  <Textarea
                    id="html"
                    rows={6}
                    value={testEmail.html}
                    onChange={(e) => setTestEmail(prev => ({ ...prev, html: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={sendTestEmailMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendTestEmailMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>

                  {sendTestEmailMutation.isSuccess && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Email sent successfully!
                    </div>
                  )}

                  {sendTestEmailMutation.isError && (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      Error: {sendTestEmailMutation.error?.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Logs
                  </div>
                  <Button
                    onClick={() => retryFailedEmailsMutation.mutate()}
                    disabled={retryFailedEmailsMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    {retryFailedEmailsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Retry Failed
                  </Button>
                </CardTitle>
                <CardDescription>
                  Monitor email delivery status and retry failed emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emailLogs?.logs && emailLogs.logs.length > 0 ? emailLogs.logs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{log.to}</span>
                            {log.cc && (
                              <span className="text-sm text-gray-500">CC: {log.cc}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(log.status)}
                            {getTypeBadge(log.type)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Subject:</strong> {log.subject}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Attempt {log.attempt}</span>
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        {log.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>Error:</strong> {log.error}
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        No email logs found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMTP Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  SMTP Configuration
                </CardTitle>
                <CardDescription>
                  Current email server configuration (read-only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>SMTP Host</Label>
                      <Input value="smtp.office365.com" readOnly />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input value="587" readOnly />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input value="hr@costaatt.edu.tt" readOnly />
                    </div>
                    <div>
                      <Label>From Address</Label>
                      <Input value="hr@costaatt.edu.tt" readOnly />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Email Features</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✅ Office 365 SMTP integration</li>
                      <li>✅ HTML email templates</li>
                      <li>✅ Automatic CC logic based on user roles</li>
                      <li>✅ Email logging and retry system</li>
                      <li>✅ 3-attempt retry with 10-minute intervals</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

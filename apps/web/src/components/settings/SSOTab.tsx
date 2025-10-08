import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

export function SSOTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Single Sign-On (SSO)</h3>
          <p className="text-sm text-gray-600">Configure Microsoft 365 SSO integration</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          Configured
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SSO Configuration</CardTitle>
          <CardDescription>
            Microsoft 365 SSO is configured and active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Azure Client ID</label>
                <p className="text-sm text-gray-600 mt-1 font-mono">7911cfad-b0d5-419c-83b2-62aab8833a66</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Azure Tenant ID</label>
                <p className="text-sm text-gray-600 mt-1 font-mono">023c2cf6-b378-495b-a3cd-591490b7f6e1</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Redirect URI</label>
                <p className="text-sm text-gray-600 mt-1 font-mono">http://localhost:5173</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Provider</label>
                <p className="text-sm text-gray-600 mt-1">Microsoft 365</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Last Updated:</strong> {new Date().toLocaleString()}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              <Button variant="outline">
                Sync Groups
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Download } from 'lucide-react';

export function AuditTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Audit Logs</h3>
          <p className="text-sm text-gray-600">View system activity and changes</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Track all system changes and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Audit logs coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

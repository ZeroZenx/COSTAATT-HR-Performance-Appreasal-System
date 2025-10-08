import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Play, CheckCircle, AlertCircle } from 'lucide-react';

export function BackupTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Backup Management</h3>
          <p className="text-sm text-gray-600">System backups and data protection</p>
        </div>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Create Backup
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">2 hours ago</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Backup Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">245 MB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Next Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Daily at 2:00 AM</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Status</CardTitle>
          <CardDescription>
            Monitor backup operations and system health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Backup management coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

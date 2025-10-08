import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Users, 
  FileText, 
  Calendar, 
  Shield, 
  Download, 
  Upload, 
  History, 
  Database, 
  HelpCircle,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Import individual tab components
import { CyclesTab } from '@/components/settings/CyclesTab';
import { TemplatesTab } from '@/components/settings/TemplatesTab';
import { UsersTab } from '@/components/settings/UsersTab';
import { SSOTab } from '@/components/settings/SSOTab';
import { ImportExportTab } from '@/components/settings/ImportExportTab';
import { AuditTab } from '@/components/settings/AuditTab';
import { ConfigTab } from '@/components/settings/ConfigTab';
import { BackupTab } from '@/components/settings/BackupTab';
import { HelpTab } from '@/components/settings/HelpTab';

export default function SettingsPage() {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAppraisals: 0,
    completedAppraisals: 0,
    completionRate: 0,
    totalCycles: 0,
    activeCycles: 0,
  });

  const [healthStatus, setHealthStatus] = useState({
    database: 'healthy',
    storage: 'healthy',
    sso: 'healthy',
    overall: 'healthy',
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={healthStatus.overall === 'healthy' ? 'default' : 'destructive'}>
            {healthStatus.overall === 'healthy' ? (
              <><CheckCircle className="h-4 w-4 mr-1" /> System Healthy</>
            ) : (
              <><AlertCircle className="h-4 w-4 mr-1" /> System Issues</>
            )}
          </Badge>
        </div>
      </div>

      {/* System Status Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appraisals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.completedAppraisals} of {systemStats.totalAppraisals} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cycles</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeCycles}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.totalCycles} total cycles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthStatus.overall === 'healthy' ? 'Healthy' : 'Issues'}
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="cycles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="cycles">
          <CyclesTab />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="sso">
          <SSOTab />
        </TabsContent>

        <TabsContent value="import-export">
          <ImportExportTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab />
        </TabsContent>

        <TabsContent value="config">
          <ConfigTab />
        </TabsContent>

        <TabsContent value="backup">
          <BackupTab />
        </TabsContent>

        <TabsContent value="help">
          <HelpTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
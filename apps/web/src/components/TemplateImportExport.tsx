import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';

interface TemplateImportExportProps {
  onImport: (templates: any[]) => void;
  templates: any[];
}

export function TemplateImportExport({ onImport, templates }: TemplateImportExportProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importResults, setImportResults] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportStatus('idle');
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImportStatus('processing');
    setImportProgress(0);

    try {
      const text = await importFile.text();
      const templates = JSON.parse(text);
      
      // Validate template structure
      const validationResults = validateTemplates(templates);
      
      if (validationResults.errors.length > 0) {
        setImportStatus('error');
        setImportResults(validationResults);
        return;
      }

      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      onImport(templates);
      setImportStatus('success');
      setImportResults(validationResults);
      
      setTimeout(() => {
        setIsImportDialogOpen(false);
        setImportFile(null);
        setImportStatus('idle');
        setImportProgress(0);
        setImportResults(null);
      }, 2000);

    } catch (error) {
      setImportStatus('error');
      setImportResults({
        errors: ['Invalid JSON format'],
        warnings: [],
        imported: 0,
        total: 0
      });
    }
  };

  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      templates: templates.map(template => ({
        name: template.name,
        displayName: template.displayName,
        type: template.type,
        version: template.version,
        description: template.description,
        configJson: template.configJson,
        sections: template.sections || []
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appraisal-templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExportDialogOpen(false);
  };

  const validateTemplates = (templates: any[]) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validCount = 0;

    if (!Array.isArray(templates)) {
      errors.push('Template data must be an array');
      return { errors, warnings, imported: 0, total: 0 };
    }

    templates.forEach((template, index) => {
      if (!template.name) {
        errors.push(`Template ${index + 1}: Missing name`);
      }
      if (!template.displayName) {
        errors.push(`Template ${index + 1}: Missing display name`);
      }
      if (!template.type) {
        errors.push(`Template ${index + 1}: Missing type`);
      }
      if (!template.configJson) {
        warnings.push(`Template ${index + 1}: Missing configuration`);
      }
      
      if (template.name && template.displayName && template.type) {
        validCount++;
      }
    });

    return {
      errors,
      warnings,
      imported: validCount,
      total: templates.length
    };
  };

  return (
    <>
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Appraisal Templates</DialogTitle>
            <DialogDescription>
              Import appraisal templates from a JSON file. The file should contain an array of template objects.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="template-file"
                />
                <label htmlFor="template-file" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">
                    {importFile ? importFile.name : 'Click to select a JSON file'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supported format: JSON file with template array
                  </p>
                </label>
              </div>
            </div>

            {importStatus === 'processing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing templates...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            {importResults && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {importStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {importStatus === 'success' ? 'Import Successful' : 'Import Failed'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Imported</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {importResults.imported}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-600">
                        {importResults.total}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {importResults.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {importResults.errors.map((error: string, index: number) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResults.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-2">Warnings:</h4>
                    <ul className="text-sm text-yellow-600 space-y-1">
                      {importResults.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportFile(null);
                  setImportStatus('idle');
                  setImportProgress(0);
                  setImportResults(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importFile || importStatus === 'processing'}
              >
                {importStatus === 'processing' ? 'Importing...' : 'Import Templates'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Templates
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Appraisal Templates</DialogTitle>
            <DialogDescription>
              Export all appraisal templates to a JSON file for backup or sharing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Export Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Total templates: {templates.length}</p>
                <p>• Active templates: {templates.filter(t => t.active).length}</p>
                <p>• Published templates: {templates.filter(t => t.published).length}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Templates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Template Backup Component
export function TemplateBackup() {
  const [backupStatus, setBackupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');

  const createBackup = async () => {
    setBackupStatus('creating');
    
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        templates: [], // This would be populated with actual template data
        metadata: {
          totalTemplates: 0,
          activeTemplates: 0,
          lastModified: new Date().toISOString()
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setBackupStatus('success');
      setTimeout(() => setBackupStatus('idle'), 2000);
    } catch (error) {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Backup</CardTitle>
        <CardDescription>Create a backup of all your appraisal templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>• Includes all template configurations</p>
            <p>• Preserves template relationships</p>
            <p>• Can be restored later if needed</p>
          </div>
          
          <Button
            onClick={createBackup}
            disabled={backupStatus === 'creating'}
            className="w-full"
          >
            {backupStatus === 'creating' ? (
              'Creating Backup...'
            ) : backupStatus === 'success' ? (
              'Backup Created!'
            ) : backupStatus === 'error' ? (
              'Backup Failed'
            ) : (
              'Create Backup'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

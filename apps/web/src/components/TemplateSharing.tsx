import React, { useState } from 'react';
import { Share2, Copy, Mail, Link, Users, Lock, Globe, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface TemplateSharingProps {
  template: any;
  onShare: (shareData: any) => void;
}

export function TemplateSharing({ template, onShare }: TemplateSharingProps) {
  const [shareSettings, setShareSettings] = useState({
    visibility: 'private',
    allowCopy: false,
    allowEdit: false,
    expiresAt: '',
    allowedUsers: [] as string[],
    allowedDepartments: [] as string[]
  });

  const [shareLink, setShareLink] = useState('');
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const templateId = template.id;
    const shareToken = Math.random().toString(36).substring(2, 15);
    const link = `${baseUrl}/templates/shared/${templateId}?token=${shareToken}`;
    setShareLink(link);
    setIsLinkGenerated(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const sendEmail = () => {
    const subject = `Template Shared: ${template.displayName}`;
    const body = `You have been given access to the template "${template.displayName}".\n\nAccess it here: ${shareLink}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="space-y-6">
      {/* Share Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Share Settings</CardTitle>
          <CardDescription>Configure how this template can be shared</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <Select value={shareSettings.visibility} onValueChange={(value) => setShareSettings({...shareSettings, visibility: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Private - Only you can access
                  </div>
                </SelectItem>
                <SelectItem value="internal">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Internal - Organization members only
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Public - Anyone with link can access
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shareSettings.allowCopy}
                    onChange={(e) => setShareSettings({...shareSettings, allowCopy: e.target.checked})}
                    className="mr-2"
                  />
                  Allow copying
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shareSettings.allowEdit}
                    onChange={(e) => setShareSettings({...shareSettings, allowEdit: e.target.checked})}
                    className="mr-2"
                  />
                  Allow editing
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration</label>
              <Input
                type="date"
                value={shareSettings.expiresAt}
                onChange={(e) => setShareSettings({...shareSettings, expiresAt: e.target.value})}
                placeholder="No expiration"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Share Template</CardTitle>
          <CardDescription>Generate a shareable link for this template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLinkGenerated ? (
            <Button onClick={generateShareLink} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Generate Share Link
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                <div className="flex space-x-2">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={sendEmail} className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send via Email
                </Button>
                <Button variant="outline" onClick={() => window.open(shareLink, '_blank')} className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Link
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Share Settings Applied:</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>• Visibility: {shareSettings.visibility}</p>
                  <p>• Allow Copy: {shareSettings.allowCopy ? 'Yes' : 'No'}</p>
                  <p>• Allow Edit: {shareSettings.allowEdit ? 'Yes' : 'No'}</p>
                  {shareSettings.expiresAt && <p>• Expires: {new Date(shareSettings.expiresAt).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Shares */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shares</CardTitle>
          <CardDescription>Manage active shares for this template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock recent shares */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Technology Services Team</p>
                  <p className="text-sm text-gray-500">Shared 2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Active</Badge>
                <Button variant="outline" size="sm">Revoke</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">john.doe@costaatt.edu.tt</p>
                  <p className="text-sm text-gray-500">Shared 1 week ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Expired</Badge>
                <Button variant="outline" size="sm">Renew</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, FileText } from 'lucide-react';

export function HelpTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Help & Support</h3>
          <p className="text-sm text-gray-600">Documentation, FAQs, and HR Digital Assistant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documentation
            </CardTitle>
            <CardDescription>
              User guides and system documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Employee Guide
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Supervisor Guide
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Admin Guide
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              HR Digital Assistant
            </CardTitle>
            <CardDescription>
              AI-powered help and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Chatbot integration coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Common questions and answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">How do I complete my self-appraisal?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Navigate to the Self-Appraisal section and follow the guided process...
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">How do I submit evidence for my appraisal?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Use the Evidence section to upload supporting documents...
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">What if I need to change my appraisal after submission?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Contact your supervisor or HR administrator for assistance...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

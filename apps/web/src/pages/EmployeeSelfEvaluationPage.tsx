import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ui/toast';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Edit, 
  Save, 
  Send,
  AlertCircle,
  User,
  Calendar,
  Download
} from 'lucide-react';
import { generateCurrentSelfEvaluationPDF } from '../utils/pdfGenerator';

export function EmployeeSelfEvaluationPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: '',
    question6: '',
    question7: '',
    question8: ''
  });

  // Fetch self-evaluation data
  const { data: selfEvaluationData, isLoading } = useQuery({
    queryKey: ['self-evaluation', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const token = localStorage.getItem('token');
      const response = await fetch(`http://10.2.1.27:3000/self-evaluations/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        // If no self-evaluation exists, return null
        if (response.status === 404) return null;
        throw new Error('Failed to fetch self-evaluation');
      }
      const data = await response.json();
      return data.data || null;
    },
    enabled: !!user?.id
  });

  const questions = [
    {
      id: 'question1',
      text: 'Looking at your own work over the past year, what things do you think you have done particularly well?',
      placeholder: 'Describe your key achievements and accomplishments...'
    },
    {
      id: 'question2',
      text: 'Are there any aspects of your work which have not gone so well? If so, why was this?',
      placeholder: 'Be honest about areas that need improvement...'
    },
    {
      id: 'question3',
      text: 'What has given you the greatest personal satisfaction about your work here over the past year?',
      placeholder: 'What aspects of your job do you find most rewarding...'
    },
    {
      id: 'question4',
      text: 'What were the key obstacles in accomplishing your job responsibilities?',
      placeholder: 'Describe any challenges or barriers you faced...'
    },
    {
      id: 'question5',
      text: 'Is there any way in which you would want to change the duties/responsibilities of your job to improve efficiency in your section?',
      placeholder: 'Suggest improvements to your role or processes...'
    },
    {
      id: 'question6',
      text: 'Do you feel you and the Institution might benefit if you had additional training in any aspect of your work? If so, in what area?',
      placeholder: 'Identify training needs and development opportunities...'
    },
    {
      id: 'question7',
      text: 'What goals do you have for the next review period? What type of support do you need?',
      placeholder: 'Set clear objectives and identify support needed...'
    },
    {
      id: 'question8',
      text: 'Are there any other suggestions you would like to make to help improve efficiency or job satisfaction in your section or anywhere else in the organization?',
      placeholder: 'Share ideas for organizational improvement...'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://10.2.1.27:3000/self-evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: user?.id,
          responses: formData,
          status: 'DRAFT'
        })
      });

      if (response.ok) {
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ['self-evaluation', user?.id] });
        addToast({
          type: 'success',
          title: 'Self-evaluation saved',
          description: 'Your self-evaluation has been saved as a draft successfully.',
          duration: 4000
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save self-evaluation');
      }
    } catch (error) {
      console.error('Error saving self-evaluation:', error);
      addToast({
        type: 'error',
        title: 'Save failed',
        description: error.message || 'Failed to save your self-evaluation. Please try again.',
        duration: 6000
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://10.2.1.27:3000/self-evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: user?.id,
          responses: formData,
          status: 'SUBMITTED'
        })
      });

      if (response.ok) {
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ['self-evaluation', user?.id] });
        addToast({
          type: 'success',
          title: 'Self-evaluation submitted successfully!',
          description: 'Your self-evaluation has been submitted and will be reviewed by your supervisor.',
          duration: 5000
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit self-evaluation');
      }
    } catch (error) {
      console.error('Error submitting self-evaluation:', error);
      addToast({
        type: 'error',
        title: 'Submission failed',
        description: error.message || 'Failed to submit your self-evaluation. Please try again.',
        duration: 6000
      });
    }
  };

  const handleEdit = () => {
    if (selfEvaluationData) {
      setFormData(selfEvaluationData.responses || formData);
    }
    setIsEditing(true);
  };

  const handleDownloadPDF = () => {
    try {
      const employeeName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      const employeeEmail = user?.email || '';
      const responses = selfEvaluationData?.responses || formData;
      
      generateCurrentSelfEvaluationPDF(employeeName, employeeEmail, responses);
      
      addToast({
        type: 'success',
        title: 'PDF Downloaded',
        description: 'Your self-evaluation has been downloaded as a PDF.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      addToast({
        type: 'error',
        title: 'PDF Generation Failed',
        description: 'Failed to generate PDF. Please try again.',
        duration: 5000
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading self-evaluation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Self-Evaluation</h1>
                <p className="mt-2 text-gray-600">Complete your self-assessment for the performance review period</p>
              </div>
              <div>
                {!isEditing && !selfEvaluationData && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Start Evaluation
                  </button>
                )}
                {!isEditing && selfEvaluationData && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Evaluation
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  </div>
                )}
                {isEditing && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Card */}
          {selfEvaluationData && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {selfEvaluationData.status === 'SUBMITTED' ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <Clock className="w-8 h-8 text-yellow-500" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selfEvaluationData.status === 'SUBMITTED' ? 'Evaluation Submitted' : 'Draft Saved'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selfEvaluationData.status === 'SUBMITTED' 
                        ? 'Your self-evaluation has been submitted for review.'
                        : 'Your self-evaluation is saved as a draft. You can continue editing or submit when ready.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Self-Evaluation Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Performance Management and Appraisal Employee Self-Evaluation Form</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Employee's Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Title:</strong> {user?.title}</p>
                <p><strong>Department:</strong> {user?.dept}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-6">
                This form is to help you prepare for your performance appraisal which is the final stage of the Performance Management Appraisal System. 
                The document is to be submitted to your supervisor, two (2) weeks prior to the date set for the evaluation.
              </p>

              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {index + 1}) {question.text}
                    </label>
                    {isEditing ? (
                      <textarea
                        name={question.id}
                        value={formData[question.id as keyof typeof formData]}
                        onChange={handleInputChange}
                        placeholder={question.placeholder}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {formData[question.id as keyof typeof formData] || 'No response provided'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isEditing && !selfEvaluationData && (
                <div className="mt-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Self-Evaluation Found</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't completed a self-evaluation yet. Click "Start Evaluation" to begin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

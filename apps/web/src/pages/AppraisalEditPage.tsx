import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { ArrowLeft, Save, Send, Users, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';

// interface Competency {
//   id: string;
//   name: string;
//   description: string;
//   weight: number;
//   category: string;
// }

// Removed unused interface

export function AppraisalEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});
  const [overallScore, setOverallScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState(false);

  // Fetch appraisal data
  const { data: appraisal, isLoading: appraisalLoading, error: appraisalError } = useQuery({
    queryKey: ['appraisal', id],
    queryFn: async () => {
      console.log('Fetching appraisal with ID:', id);
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch appraisal: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Appraisal data received:', data);
      console.log('Data success:', data.success);
      console.log('Data data:', data.data);
      console.log('Template ID from appraisal:', data.data?.templateId);
      return data;
    },
    enabled: !!id
  });

  // Fetch form data (template and competencies)
  const { data: formDataResponse, isLoading: formDataLoading, error: formDataError } = useQuery({
    queryKey: ['appraisal-form-data', appraisal?.data?.templateId],
    queryFn: async () => {
      console.log('Fetching form data for template ID:', appraisal?.data?.templateId);
      const response = await fetch(`http://10.2.1.27:3000/api/appraisals/form-data/${appraisal?.data?.templateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Form data response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Form data API Error:', errorText);
        throw new Error(`Failed to fetch form data: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Form data received:', data);
      return data;
    },
    enabled: (() => {
      const enabled = !!appraisal?.success && !!appraisal?.data?.templateId;
      console.log('Form data query enabled:', enabled, {
        appraisalSuccess: appraisal?.success,
        templateId: appraisal?.data?.templateId
      });
      return enabled;
    })()
  });

  // Fetch employee self-evaluation if it exists
  const { data: selfEvalData } = useQuery({
    queryKey: ['employee-self-eval', appraisal?.data?.employee?.email, appraisal?.data?.cycle?.id],
    queryFn: async () => {
      // Use the employee's email (user ID) instead of employee database ID
      const employeeEmail = appraisal?.data?.employee?.email;
      const cycleId = appraisal?.data?.cycle?.id;
      
      console.log('Fetching self-evaluation for:', { employeeEmail, cycleId });
      
      const response = await fetch(`http://10.2.1.27:3000/api/appraisals/self-evaluation/${employeeEmail}/${cycleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Self-evaluation response status:', response.status);
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No self-evaluation found for this employee/cycle');
          return null;
        }
        const errorText = await response.text();
        console.error('Self-evaluation API Error:', errorText);
        return null;
      }
      
      const data = await response.json();
      console.log('Self-evaluation data received:', data);
      return data;
    },
    enabled: !!appraisal?.success && !!appraisal?.data?.employee?.email && !!appraisal?.data?.cycle?.id
  });

  // Initialize form data when appraisal loads
  useEffect(() => {
    if (appraisal && appraisal.success && appraisal.data) {
      console.log('Loading appraisal data for editing:', appraisal.data);
      
      // Try to get form data from either managerReviewData or selfAppraisalData
      let existingFormData = appraisal.data.managerReviewData || appraisal.data.selfAppraisalData || {};
      
      // If the data is a string, parse it
      if (typeof existingFormData === 'string') {
        try {
          existingFormData = JSON.parse(existingFormData);
        } catch (error) {
          console.error('Error parsing form data:', error);
          existingFormData = {};
        }
      }
      
      // Clean up the data - remove character-by-character keys and keep only the real form fields
      const cleanedFormData: any = {};
      Object.keys(existingFormData).forEach(key => {
        // Only keep keys that look like form fields (not numeric character indices)
        if (!/^\d+$/.test(key) && (key.startsWith('competency_') || key.startsWith('comments_') || key === 'digitalSignature' || key === 'submittedAt' || key === 'submittedBy')) {
          cleanedFormData[key] = existingFormData[key];
        }
      });
      
      console.log('Cleaned form data:', cleanedFormData);
      setFormData(cleanedFormData);
      setOverallScore(appraisal.data.overallScore || 0);
      
      // Set digital signature if it exists
      if (cleanedFormData.digitalSignature) {
        setDigitalSignature(true);
      }
    }
  }, [appraisal]);

  // Get sections from template config
  const templateSections = formDataResponse?.data?.sections || appraisal?.data?.template?.configJson?.sections || [];

  // Debug: Log key data for troubleshooting
  console.log('Template sections count:', templateSections.length, 'Selected competencies count:', appraisal?.data?.competencies?.length || 0);

  // Helper function to check if a section should be filtered for selected competencies
  const isCompetencySection = (section: any) => {
    // Check if this is a section that contains competencies that should be filtered
    const competencySectionKeywords = ['competency', 'core', 'competencies'];
    const sectionKey = section.key?.toLowerCase() || '';
    const sectionTitle = section.title?.toLowerCase() || '';
    
    return competencySectionKeywords.some(keyword => 
      sectionKey.includes(keyword) || sectionTitle.includes(keyword)
    );
  };


  // Process sections: replace competency sections with selected competencies, keep others intact
  const sections = React.useMemo(() => {
    const selectedCompetencies = appraisal?.data?.competencies || [];
    
    if (selectedCompetencies.length === 0) {
      console.log('No selected competencies, showing all template sections');
      return templateSections;
    }

    console.log('Replacing competency sections with selected competencies, keeping other sections');
    
    // Check if we need to replace any competency sections
    const hasCompetencySections = templateSections.some((section: any) => isCompetencySection(section));
    
    if (!hasCompetencySections) {
      // No competency sections to replace, just add selected competencies as new section
      const selectedSection = {
        key: 'selected_competencies',
        title: 'Manager Selected Competencies',
        weight: 0.3,
        items: selectedCompetencies.map((ac: any) => ({
          key: ac.competency.id,
          id: ac.competency.id,
          code: ac.competency.code,
          name: ac.competency.name,
          title: ac.competency.name,
          description: ac.competency.description,
          scale: '1-5',
          weight: 1.0 / selectedCompetencies.length,
          cluster: ac.competency.cluster
        }))
      };
      return [selectedSection, ...templateSections];
    }

    // Replace competency sections with selected competencies, keep others
    const processedSections = templateSections.map((section: any) => {
      if (isCompetencySection(section)) {
        // Replace competency section with selected competencies
        return {
          key: section.key,
          title: 'Manager Selected Competencies',
          weight: section.weight, // Keep original weight
          items: selectedCompetencies.map((ac: any) => ({
            key: ac.competency.id,
            id: ac.competency.id,
            code: ac.competency.code,
            name: ac.competency.name,
            title: ac.competency.name,
            description: ac.competency.description,
            scale: '1-5',
            weight: 1.0 / selectedCompetencies.length,
            cluster: ac.competency.cluster
          }))
        };
      } else {
        // Keep non-competency sections unchanged
        return section;
      }
    });

    return processedSections;
  }, [templateSections, appraisal?.data?.competencies]);

  // No longer needed since we replace sections entirely when competencies are selected

  // Calculate overall score when form data changes
  useEffect(() => {
    if (sections && sections.length > 0) {
      let totalWeightedScore = 0;
      let totalWeight = 0;

      sections.forEach((section: any) => {
        if (section.items) {
          section.items.forEach((competency: any) => {
            const score = formData[`competency_${competency.key}`] || 0;
            const sectionWeight = section.weight || 0;
            const itemWeight = competency.weight || 0;
            const combinedWeight = sectionWeight * itemWeight;

            totalWeightedScore += score * combinedWeight;
            totalWeight += combinedWeight;
          });
        }
      });

      const calculatedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      setOverallScore(Math.round(calculatedScore * 100) / 100);
    }
  }, [formData, sections, appraisal?.data]);

  // Calculate section score
  const calculateSectionScore = (section: any) => {
    if (!section.items) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    section.items.forEach((competency: any) => {
      const score = formData[`competency_${competency.key}`] || 0;
      const itemWeight = competency.weight || 0;
      
      totalWeightedScore += score * itemWeight;
      totalWeight += itemWeight;
    });
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'DRAFT',
          formData: data,
          overallScore: Math.round((overallScore / 5) * 100) // Convert to percentage for storage
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Draft save error:', errorText);
        throw new Error(`Failed to save draft: ${response.status} ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisal', id] });
    }
  });

  // Submit appraisal mutation
  const submitAppraisalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'SUBMITTED',
          formData: data,
          overallScore: Math.round((overallScore / 5) * 100) // Convert to percentage for storage
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submission error:', errorText);
        throw new Error(`Failed to submit appraisal: ${response.status} ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisals'] });
      navigate('/appraisals');
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await saveDraftMutation.mutateAsync(formData);
      alert('Draft saved successfully!');
    } catch (error) {
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAppraisal = async () => {
    if (overallScore === 0) {
      alert('Please complete the appraisal form before submitting.');
      return;
    }

    if (!digitalSignature) {
      alert('Please confirm your review by checking the digital signature checkbox.');
      return;
    }

    if (confirm('Are you sure you want to submit this appraisal? This action cannot be undone.')) {
      setIsSubmitting(true);
      try {
        const submissionData = {
          ...formData,
          digitalSignature: true,
          submittedAt: new Date().toISOString(),
          submittedBy: localStorage.getItem('userId') || 'unknown'
        };
        await submitAppraisalMutation.mutateAsync(submissionData);
        alert('Appraisal submitted successfully!');
      } catch (error) {
        alert('Failed to submit appraisal. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-100';
    if (score >= 3) return 'text-yellow-600 bg-yellow-100';
    if (score >= 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Satisfactory';
    if (score >= 1.5) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  if (appraisalLoading || formDataLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appraisal form...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (appraisalError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Appraisal</h2>
            <p className="text-gray-600 mb-4">Error: {appraisalError.message}</p>
            <button
              onClick={() => navigate('/appraisals')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Appraisals
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!appraisal || !appraisal.success || !appraisal.data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Appraisal not found</p>
            <p className="text-sm text-gray-500 mt-2">
              Appraisal: {appraisal ? 'exists' : 'null'}, 
              Success: {appraisal?.success ? 'true' : 'false'}, 
              Data: {appraisal?.data ? 'exists' : 'null'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (formDataLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading form data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (formDataError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Form Data</h2>
            <p className="text-gray-600 mb-4">Error: {formDataError.message}</p>
            <button
              onClick={() => navigate('/appraisals')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Appraisals
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!formDataResponse) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Form data not found</p>
            <p className="text-sm text-gray-500 mt-2">
              Template ID: {appraisal?.data?.templateId || 'undefined'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const appraisalData = appraisal.data;

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/appraisals')}
                className="flex items-center text-gray-500 hover:text-gray-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>← Back to Appraisals</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance Appraisal</h1>
                <p className="text-gray-600">
                  {appraisalData.employee.user.firstName} {appraisalData.employee.user.lastName} - {appraisalData.template.name}
                </p>
              </div>
            </div>
            
            {/* Overall Score Display */}
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-lg ${getScoreColor(overallScore)}`}>
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-bold text-lg">{((overallScore / 5.0) * 100).toFixed(1)}%</span>
                <span className="ml-2 text-sm">{getScoreLabel(overallScore)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Employee & Cycle Info */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Appraisal Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {appraisalData.employee.user.firstName} {appraisalData.employee.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{appraisalData.employee.user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Template</p>
                    <p className="text-lg font-semibold text-gray-900">{appraisalData.template.name}</p>
                    <p className="text-sm text-gray-600">{appraisalData.template.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Appraisal Cycle</p>
                    <p className="text-lg font-semibold text-gray-900">{appraisalData.cycle.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appraisalData.cycle.periodStart).toLocaleDateString()} - {new Date(appraisalData.cycle.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manager Selected Competencies */}
          {appraisalData.competencies && appraisalData.competencies.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Manager Selected Competencies</h2>
                <p className="text-sm text-gray-600">The 3 competencies selected by the manager for this appraisal</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {appraisalData.competencies.map((appraisalCompetency: any, index: number) => (
                    <div key={appraisalCompetency.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{appraisalCompetency.competency.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{appraisalCompetency.competency.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {appraisalCompetency.competency.code && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {appraisalCompetency.competency.code}
                          </span>
                        )}
                        {appraisalCompetency.competency.cluster && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {appraisalCompetency.competency.cluster.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Competency Assessment Form */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Competency Assessment</h2>
                  <p className="text-sm text-gray-600">Rate each competency on a scale of 1-5 based on performance evidence</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Completion</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {Math.round((Object.keys(formData).filter(key => key.startsWith('competency_') && formData[key]).length / 
                      sections.reduce((total: number, section: any) => 
                        total + (section.items?.length || 0), 0)) * 100) || 0}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-12">
                {sections.map((section: any) => {
                  return (
                  <div key={section.key} className="border border-gray-200 rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Weight: <span className="font-medium">{Math.round((section.weight || 0) * 100)}%</span></span>
                        <span>•</span>
                        <span>Items: {section.items?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {section.items?.map((competency: any) => (
                        <div key={competency.key} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {competency.title}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Weight: <span className="font-medium">{Math.round((competency.weight || 0) * 100)}%</span></span>
                                <span>•</span>
                                <span>Scale: {competency.scale || '1-5'}</span>
                              </div>
                            </div>
                          </div>
                    
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Manager Rating Section */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-3">
                                Manager Rating *
                              </label>
                              <div className="grid grid-cols-5 gap-3">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <button
                                    key={score}
                                    onClick={() => handleInputChange(`competency_${competency.key}`, score)}
                                    className={`p-4 text-center rounded-lg border-2 transition-all duration-200 min-h-[80px] flex flex-col justify-center ${
                                      formData[`competency_${competency.key}`] === score
                                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="font-bold text-lg mb-1">{score}</div>
                                    <div className="text-xs text-gray-500 leading-tight">
                                      {score === 1 ? 'Unsatisfactory' : 
                                       score === 2 ? 'Needs Improvement' : 
                                       score === 3 ? 'Meets Expectations' : 
                                       score === 4 ? 'Exceeds Expectations' : 'Outstanding'}
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <div className="mt-3 text-xs text-gray-500">
                                <strong>Rating Guide:</strong> 1=Unsatisfactory, 2=Needs Improvement, 3=Meets Expectations, 4=Exceeds Expectations, 5=Outstanding
                              </div>
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Manager Comments & Evidence *
                                </label>
                                <textarea
                                  value={formData[`comments_${competency.key}`] || ''}
                                  onChange={(e) => handleInputChange(`comments_${competency.key}`, e.target.value)}
                                  placeholder="Provide specific examples, evidence, and justification for this rating..."
                                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Include specific examples of performance, achievements, or areas for improvement
                                </p>
                              </div>
                            </div>
                            
                            {/* Employee Self-Evaluation Section - Single Form */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-3">
                                Employee Self-Evaluation
                                {selfEvalData?.data ? (
                                  <span className="text-green-600 text-sm ml-2">✓ Available</span>
                                ) : (
                                  <span className="text-gray-400 text-sm ml-2">Not submitted</span>
                                )}
                              </label>
                              {selfEvalData?.data ? (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="mb-3">
                                    <span className="text-sm font-medium text-blue-900">Employee Self-Evaluation Form Submitted</span>
                                  </div>
                                  <div className="bg-white p-3 rounded border">
                                    <p className="text-sm text-gray-800">
                                      <strong>Employee has completed the self-evaluation form.</strong><br/>
                                      <span className="text-xs text-gray-600">View full self-evaluation in the Employee Self-Evaluation section below.</span>
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                  <p className="text-sm text-gray-500">Employee has not submitted self-evaluation form</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Employee Self-Evaluation Form */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Employee Self-Evaluation Form</h2>
              <p className="text-sm text-gray-600">Employee's self-assessment and feedback</p>
            </div>
            
            <div className="p-6">
              {selfEvalData?.data ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Self-Evaluation Submitted</span>
                    </div>
                    <p className="text-sm text-green-800">
                      Employee has completed the self-evaluation form. Review their responses below.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">PERFORMANCE MANAGEMENT AND APPRAISAL</h3>
                    <h4 className="text-md font-semibold text-gray-800 mb-6">EMPLOYEE SELF-EVALUATION FORM</h4>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Employee's Name:</span> {appraisalData.employee.user.firstName} {appraisalData.employee.user.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Title:</span> {appraisalData.employee.user.title}
                        </div>
                        <div>
                          <span className="font-medium">Department:</span> {appraisalData.employee.dept}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {selfEvalData.data.submittedAt ? new Date(selfEvalData.data.submittedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">1) Looking at your own work over the past year, what things do you think you have done particularly well?</h5>
                          <div className="bg-white p-3 border rounded text-sm text-gray-700 min-h-[80px]">
                            {selfEvalData.data.question1 || 'No response provided'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">2) Are there any aspects of your work which have not gone so well? If so, why was this?</h5>
                          <div className="bg-white p-3 border rounded text-sm text-gray-700 min-h-[80px]">
                            {selfEvalData.data.question2 || 'No response provided'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">3) What has given you the greatest personal satisfaction about your work here over the past year?</h5>
                          <div className="bg-white p-3 border rounded text-sm text-gray-700 min-h-[80px]">
                            {selfEvalData.data.question3 || 'No response provided'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">4) What were the key obstacles in accomplishing your job responsibilities?</h5>
                          <div className="bg-white p-3 border rounded text-sm text-gray-700 min-h-[80px]">
                            {selfEvalData.data.question4 || 'No response provided'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">5) Is there any way in which you would want to change the duties/responsibilities of your job to improve efficiency in your section?</h5>
                          <div className="bg-white p-3 border rounded text-sm text-gray-700 min-h-[80px]">
                            {selfEvalData.data.question5 || 'No response provided'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">6) Do you feel you and the Institution might benefit if you had additional training in any aspect of your work? If so, in what area?</h5>
                          <div className="bg-white p-3 border rounded text-sm text-gray-700 min-h-[80px]">
                            {selfEvalData.data.question6 || 'No response provided'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">7) What goals do you have for the next review period? What type of support do you need?</h5>
                          <div className="bg-white p-3 border rounded text-sm text-gray-700 min-h-[80px]">
                            {selfEvalData.data.question7 || 'No response provided'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">8) Are there any other suggestions you would like make to help improve efficiency or job satisfaction in your section or anywhere else in the organization?</h5>
                          <div className="bg-white p-3 border rounded text-sm text-gray-700 min-h-[80px]">
                            {selfEvalData.data.question8 || 'No response provided'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Self-Evaluation Submitted</h3>
                  <p className="text-gray-600 mb-4">
                    The employee has not yet submitted their self-evaluation form.
                  </p>
                  <p className="text-sm text-gray-500">
                    The employee should complete the self-evaluation form 2 weeks prior to the appraisal date.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Competency Summary */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Competency Assessment Summary</h2>
              <p className="text-sm text-gray-600">Section scores and overall performance rating</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section: any) => {
                  const sectionScore = calculateSectionScore(section);
                  return (
                    <div key={section.key} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Score:</span>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(sectionScore)}`}>
                          {((sectionScore / 5.0) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Weight: {Math.round((section.weight || 0) * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Overall Performance Score</h3>
                    <p className="text-sm text-gray-600">Weighted average of all competencies</p>
                  </div>
                  <div className={`px-6 py-3 rounded-lg ${getScoreColor(overallScore)}`}>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{((overallScore / 5.0) * 100).toFixed(1)}%</div>
                      <div className="text-sm">{getScoreLabel(overallScore)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Signature Section */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Digital Signature</h2>
              <p className="text-sm text-gray-600">Confirm your review and submit the appraisal</p>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="digitalSignature"
                  checked={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.checked)}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="digitalSignature" className="text-sm font-medium text-gray-700">
                    I confirm this review
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    By checking this box, I confirm that I have thoroughly reviewed this performance appraisal 
                    and that the ratings and comments accurately reflect the employee's performance during this period.
                  </p>
                  <div className="mt-3 text-xs text-gray-400">
                    Digital signature: {localStorage.getItem('userName') || 'Manager'} • {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Draft'}</span>
              </button>
              
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
            
            <button
              onClick={handleSubmitAppraisal}
              disabled={isSubmitting || overallScore === 0 || !digitalSignature}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Appraisal'}</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

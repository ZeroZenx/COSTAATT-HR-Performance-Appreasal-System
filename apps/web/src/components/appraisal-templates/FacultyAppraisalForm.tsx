import React, { useState, useEffect } from 'react';

interface FacultyAppraisalFormProps {
  employeeId: string;
  cycleId: string;
  onSave: (data: any) => void;
  initialData?: any;
}

export function FacultyAppraisalForm({ employeeId, cycleId, onSave, initialData }: FacultyAppraisalFormProps) {
  const [formData, setFormData] = useState({
    functionalCompetencies: {
      teaching: { score: 0, maxScore: 20 },
      curriculumDevelopment: { score: 0, maxScore: 15 },
      studentMentoring: { score: 0, maxScore: 15 },
      research: { score: 0, maxScore: 15 },
      professionalDevelopment: { score: 0, maxScore: 15 },
      service: { score: 0, maxScore: 12 },
      innovation: { score: 0, maxScore: 12 },
      collaboration: { score: 0, maxScore: 10 }
    },
    coreCompetencies: {
      communication: { score: 0, maxScore: 10 },
      teamwork: { score: 0, maxScore: 10 },
      problemSolving: { score: 0, maxScore: 10 },
      leadership: { score: 0, maxScore: 10 },
      adaptability: { score: 0, maxScore: 10 },
      integrity: { score: 0, maxScore: 10 },
      innovation: { score: 0, maxScore: 10 },
      customerService: { score: 0, maxScore: 10 },
      timeManagement: { score: 0, maxScore: 10 },
      continuousLearning: { score: 0, maxScore: 9 }
    },
    studentEvaluations: [
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 }
    ],
    projectEvaluation: {
      enabled: false,
      title: '',
      description: '',
      score: 0,
      maxScore: 10
    }
  });

  const [calculatedScores, setCalculatedScores] = useState({
    functionalScore: 0,
    coreScore: 0,
    studentEvalScore: 0,
    projectScore: 0,
    totalWeightedScore: 0,
    finalRating: '',
    weights: {
      functional: 0.6,
      core: 0.3,
      studentEval: 0.2,
      project: 0
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    calculateScores();
  }, [formData]);

  const calculateScores = () => {
    // Auto-scaling weights based on project evaluation
    let weights = {
      functional: 0.6,
      core: 0.3,
      studentEval: 0.2,
      project: 0
    };

    if (formData.projectEvaluation.enabled) {
      weights.studentEval = 0.15;
      weights.project = 0.05;
    }

    // Functional Competencies (max: 114)
    const functionalTotal = Object.values(formData.functionalCompetencies)
      .reduce((sum, comp) => sum + comp.score, 0);
    const functionalWeighted = (functionalTotal / 114) * weights.functional;

    // Core Competencies (max: 99)
    const coreTotal = Object.values(formData.coreCompetencies)
      .reduce((sum, comp) => sum + comp.score, 0);
    const coreWeighted = (coreTotal / 99) * weights.core;

    // Student Evaluations (max: 50)
    const studentEvalTotal = formData.studentEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0);
    const studentEvalWeighted = (studentEvalTotal / 50) * weights.studentEval;

    // Project Evaluation (max: 10)
    const projectTotal = formData.projectEvaluation.enabled ? formData.projectEvaluation.score : 0;
    const projectWeighted = (projectTotal / 10) * weights.project;

    const totalWeightedScore = functionalWeighted + coreWeighted + studentEvalWeighted + projectWeighted;

    let finalRating = '';
    if (totalWeightedScore >= 0.90) finalRating = 'Outstanding';
    else if (totalWeightedScore >= 0.70) finalRating = 'Very Good';
    else if (totalWeightedScore >= 0.56) finalRating = 'Good';
    else if (totalWeightedScore >= 0.40) finalRating = 'Fair';
    else finalRating = 'Unsatisfactory';

    setCalculatedScores({
      functionalScore: functionalTotal,
      coreScore: coreTotal,
      studentEvalScore: studentEvalTotal,
      projectScore: projectTotal,
      totalWeightedScore,
      finalRating,
      weights
    });
  };

  const updateScore = (section: string, field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: { ...prev[section as keyof typeof prev][field as keyof any], score: value }
      }
    }));
  };

  const updateStudentEval = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      studentEvaluations: prev.studentEvaluations.map((evaluation, i) => 
        i === index ? { ...evaluation, [field]: value } : evaluation
      )
    }));
  };

  const updateProjectEvaluation = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      projectEvaluation: {
        ...prev.projectEvaluation,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      calculatedScores,
      employeeId,
      cycleId
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Faculty Performance Appraisal</h2>
        <p className="text-gray-600">Complete the appraisal form with auto-scaling weighted scoring</p>
      </div>

      {/* Functional Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 1: Functional Competencies (Weight: {calculatedScores.weights.functional * 100}%, Max Score: 114)
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teaching Excellence
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={formData.functionalCompetencies.teaching.score}
                onChange={(e) => updateScore('functionalCompetencies', 'teaching', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 20</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curriculum Development
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.functionalCompetencies.curriculumDevelopment.score}
                onChange={(e) => updateScore('functionalCompetencies', 'curriculumDevelopment', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 15</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Mentoring
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.functionalCompetencies.studentMentoring.score}
                onChange={(e) => updateScore('functionalCompetencies', 'studentMentoring', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 15</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research & Scholarship
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.functionalCompetencies.research.score}
                onChange={(e) => updateScore('functionalCompetencies', 'research', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 15</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Development
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.functionalCompetencies.professionalDevelopment.score}
                onChange={(e) => updateScore('functionalCompetencies', 'professionalDevelopment', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 15</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service to Institution
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={formData.functionalCompetencies.service.score}
                onChange={(e) => updateScore('functionalCompetencies', 'service', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 12</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Innovation & Technology
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={formData.functionalCompetencies.innovation.score}
                onChange={(e) => updateScore('functionalCompetencies', 'innovation', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 12</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collaboration
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.functionalCompetencies.collaboration.score}
                onChange={(e) => updateScore('functionalCompetencies', 'collaboration', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 2: Core Competencies (Weight: {calculatedScores.weights.core * 100}%, Max Score: 99)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(formData.coreCompetencies).map(([key, competency]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                min="0"
                max={competency.maxScore}
                value={competency.score}
                onChange={(e) => updateScore('coreCompetencies', key, parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: {competency.maxScore}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Evaluations Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 3: Student Evaluations (Weight: {calculatedScores.weights.studentEval * 100}%, Max Score: 50)
        </h3>
        
        <div className="space-y-4">
          {formData.studentEvaluations.map((evaluation, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Course {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={evaluation.course}
                    onChange={(e) => updateStudentEval(index, 'course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={evaluation.rating}
                    onChange={(e) => updateStudentEval(index, 'rating', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Scale: 1 (Poor) - 5 (Excellent)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Evaluation Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="projectEvaluation"
            checked={formData.projectEvaluation.enabled}
            onChange={(e) => updateProjectEvaluation('enabled', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="projectEvaluation" className="text-xl font-semibold text-gray-900">
            Section 4: Project Evaluation (Weight: {calculatedScores.weights.project * 100}%, Max Score: 10)
          </label>
        </div>
        
        {formData.projectEvaluation.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={formData.projectEvaluation.title}
                onChange={(e) => updateProjectEvaluation('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter project title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </label>
              <textarea
                value={formData.projectEvaluation.description}
                onChange={(e) => updateProjectEvaluation('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Describe the project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Score (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.projectEvaluation.score}
                onChange={(e) => updateProjectEvaluation('score', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Score Summary */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Score Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{calculatedScores.functionalScore}/114</div>
            <div className="text-sm text-gray-600">Functional ({calculatedScores.weights.functional * 100}%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{calculatedScores.coreScore}/99</div>
            <div className="text-sm text-gray-600">Core ({calculatedScores.weights.core * 100}%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{calculatedScores.studentEvalScore}/50</div>
            <div className="text-sm text-gray-600">Student Eval ({calculatedScores.weights.studentEval * 100}%)</div>
          </div>
          {formData.projectEvaluation.enabled && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{calculatedScores.projectScore}/10</div>
              <div className="text-sm text-gray-600">Project ({calculatedScores.weights.project * 100}%)</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {(calculatedScores.totalWeightedScore * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Total Weighted</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-lg font-semibold text-gray-900">
            Final Rating: <span className="text-purple-600">{calculatedScores.finalRating}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Save Appraisal
        </button>
        <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
          Submit for Review
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

interface ClinicalInstructorAppraisalFormProps {
  employeeId: string;
  cycleId: string;
  onSave: (data: any) => void;
  initialData?: any;
}

export function ClinicalInstructorAppraisalForm({ employeeId, cycleId, onSave, initialData }: ClinicalInstructorAppraisalFormProps) {
  const [formData, setFormData] = useState({
    functionalCompetencies: {
      clinicalTeaching: { score: 0, maxScore: 15 },
      patientCare: { score: 0, maxScore: 15 },
      clinicalSupervision: { score: 0, maxScore: 12 },
      professionalDevelopment: { score: 0, maxScore: 12 },
      qualityImprovement: { score: 0, maxScore: 12 },
      researchParticipation: { score: 0, maxScore: 10 },
      collaboration: { score: 0, maxScore: 5 }
    },
    coreCompetencies: {
      communication: { score: 0, maxScore: 8 },
      teamwork: { score: 0, maxScore: 8 },
      problemSolving: { score: 0, maxScore: 8 },
      leadership: { score: 0, maxScore: 8 },
      adaptability: { score: 0, maxScore: 8 },
      integrity: { score: 0, maxScore: 8 },
      innovation: { score: 0, maxScore: 8 },
      customerService: { score: 0, maxScore: 8 },
      timeManagement: { score: 0, maxScore: 8 }
    },
    studentEvaluations: [
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 },
      { course: '', rating: 0, maxRating: 5 }
    ]
  });

  const [calculatedScores, setCalculatedScores] = useState({
    functionalScore: 0,
    coreScore: 0,
    studentEvalScore: 0,
    totalWeightedScore: 0,
    finalRating: ''
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
    // Functional Competencies (weight: 0.6, max: 81)
    const functionalTotal = Object.values(formData.functionalCompetencies)
      .reduce((sum, comp) => sum + comp.score, 0);
    const functionalWeighted = (functionalTotal / 81) * 0.6;

    // Core Competencies (weight: 0.2, max: 72)
    const coreTotal = Object.values(formData.coreCompetencies)
      .reduce((sum, comp) => sum + comp.score, 0);
    const coreWeighted = (coreTotal / 72) * 0.2;

    // Student Evaluations (weight: 0.2, max: 30)
    const studentEvalTotal = formData.studentEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0);
    const studentEvalWeighted = (studentEvalTotal / 30) * 0.2;

    const totalWeightedScore = functionalWeighted + coreWeighted + studentEvalWeighted;

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
      totalWeightedScore,
      finalRating
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Clinical Instructor Performance Appraisal</h2>
        <p className="text-gray-600">Complete the appraisal form with weighted scoring</p>
      </div>

      {/* Functional Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 1: Functional Competencies (Weight: 60%, Max Score: 81)
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinical Teaching
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.functionalCompetencies.clinicalTeaching.score}
                onChange={(e) => updateScore('functionalCompetencies', 'clinicalTeaching', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 15</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Care
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.functionalCompetencies.patientCare.score}
                onChange={(e) => updateScore('functionalCompetencies', 'patientCare', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 15</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinical Supervision
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={formData.functionalCompetencies.clinicalSupervision.score}
                onChange={(e) => updateScore('functionalCompetencies', 'clinicalSupervision', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 12</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Development
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={formData.functionalCompetencies.professionalDevelopment.score}
                onChange={(e) => updateScore('functionalCompetencies', 'professionalDevelopment', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 12</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Improvement
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={formData.functionalCompetencies.qualityImprovement.score}
                onChange={(e) => updateScore('functionalCompetencies', 'qualityImprovement', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 12</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Participation
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.functionalCompetencies.researchParticipation.score}
                onChange={(e) => updateScore('functionalCompetencies', 'researchParticipation', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 10</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collaboration
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={formData.functionalCompetencies.collaboration.score}
                onChange={(e) => updateScore('functionalCompetencies', 'collaboration', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 2: Core Competencies (Weight: 20%, Max Score: 72)
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
          Section 3: Student Evaluations (Weight: 20%, Max Score: 30)
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

      {/* Score Summary */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Score Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{calculatedScores.functionalScore}/81</div>
            <div className="text-sm text-gray-600">Functional (60%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{calculatedScores.coreScore}/72</div>
            <div className="text-sm text-gray-600">Core (20%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{calculatedScores.studentEvalScore}/30</div>
            <div className="text-sm text-gray-600">Student Eval (20%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
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

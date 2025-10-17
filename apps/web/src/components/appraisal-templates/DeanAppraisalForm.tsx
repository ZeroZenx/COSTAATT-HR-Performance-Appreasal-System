import React, { useState, useEffect } from 'react';

interface DeanAppraisalFormProps {
  employeeId: string;
  cycleId: string;
  onSave: (data: any) => void;
  initialData?: any;
}

export function DeanAppraisalForm({ employeeId, cycleId, onSave, initialData }: DeanAppraisalFormProps) {
  const [formData, setFormData] = useState({
    functionalCompetencies: {
      policy: { score: 0, maxScore: 25 },
      academicLeadership: { score: 0, maxScore: 25 },
      administration: { score: 0, maxScore: 25 },
      research: { score: 0, maxScore: 25 },
      networking: { score: 0, maxScore: 17 }
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
    goals: [
      { description: '', performanceStandard: '', intendedResults: '', score: 0, maxScore: 4 },
      { description: '', performanceStandard: '', intendedResults: '', score: 0, maxScore: 4 },
      { description: '', performanceStandard: '', intendedResults: '', score: 0, maxScore: 4 }
    ]
  });

  const [calculatedScores, setCalculatedScores] = useState({
    functionalScore: 0,
    coreScore: 0,
    goalsScore: 0,
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
    // Functional Competencies (weight: 0.5, max: 117)
    const functionalTotal = Object.values(formData.functionalCompetencies)
      .reduce((sum, comp) => sum + comp.score, 0);
    const functionalWeighted = (functionalTotal / 117) * 0.5;

    // Core Competencies (weight: 0.3, max: 99)
    const coreTotal = Object.values(formData.coreCompetencies)
      .reduce((sum, comp) => sum + comp.score, 0);
    const coreWeighted = (coreTotal / 99) * 0.3;

    // Goals (weight: 0.2, max: 12)
    const goalsTotal = formData.goals.reduce((sum, goal) => sum + goal.score, 0);
    const goalsWeighted = (goalsTotal / 12) * 0.2;

    const totalWeightedScore = functionalWeighted + coreWeighted + goalsWeighted;

    let finalRating = '';
    if (totalWeightedScore >= 0.90) finalRating = 'Outstanding';
    else if (totalWeightedScore >= 0.70) finalRating = 'Very Good';
    else if (totalWeightedScore >= 0.56) finalRating = 'Good';
    else if (totalWeightedScore >= 0.40) finalRating = 'Fair';
    else finalRating = 'Unsatisfactory';

    setCalculatedScores({
      functionalScore: functionalTotal,
      coreScore: coreTotal,
      goalsScore: goalsTotal,
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

  const updateGoal = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => 
        i === index ? { ...goal, [field]: value } : goal
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dean Performance Appraisal</h2>
        <p className="text-gray-600">Complete the appraisal form with weighted scoring</p>
      </div>

      {/* Functional Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 1: Functional Competencies (Weight: 50%, Max Score: 117)
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Development
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={formData.functionalCompetencies.policy.score}
                onChange={(e) => updateScore('functionalCompetencies', 'policy', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 25</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Leadership
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={formData.functionalCompetencies.academicLeadership.score}
                onChange={(e) => updateScore('functionalCompetencies', 'academicLeadership', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 25</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administration
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={formData.functionalCompetencies.administration.score}
                onChange={(e) => updateScore('functionalCompetencies', 'administration', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 25</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research & Development
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={formData.functionalCompetencies.research.score}
                onChange={(e) => updateScore('functionalCompetencies', 'research', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 25</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Networking & Collaboration
              </label>
              <input
                type="number"
                min="0"
                max="17"
                value={formData.functionalCompetencies.networking.score}
                onChange={(e) => updateScore('functionalCompetencies', 'networking', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max: 17</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 2: Core Competencies (Weight: 30%, Max Score: 99)
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

      {/* Goals Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 3: Goals/Projects (Weight: 20%, Max Score: 12)
        </h3>
        
        <div className="space-y-6">
          {formData.goals.map((goal, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Goal {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={goal.description}
                    onChange={(e) => updateGoal(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Performance Standard
                  </label>
                  <textarea
                    value={goal.performanceStandard}
                    onChange={(e) => updateGoal(index, 'performanceStandard', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intended Results
                  </label>
                  <textarea
                    value={goal.intendedResults}
                    onChange={(e) => updateGoal(index, 'intendedResults', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-4)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={goal.score}
                    onChange={(e) => updateGoal(index, 'score', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
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
            <div className="text-2xl font-bold text-blue-600">{calculatedScores.functionalScore}/117</div>
            <div className="text-sm text-gray-600">Functional (50%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{calculatedScores.coreScore}/99</div>
            <div className="text-sm text-gray-600">Core (30%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{calculatedScores.goalsScore}/12</div>
            <div className="text-sm text-gray-600">Goals (20%)</div>
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

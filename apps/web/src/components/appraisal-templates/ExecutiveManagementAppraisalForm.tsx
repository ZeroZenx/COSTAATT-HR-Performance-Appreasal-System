import React, { useState } from 'react';
import { Button } from '../../components/ui/button';

interface ExecutiveManagementAppraisalFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function ExecutiveManagementAppraisalForm({ onSave, onCancel }: ExecutiveManagementAppraisalFormProps) {
  const [formData, setFormData] = useState({
    // Functional Competencies (weight: 0.5, max: 117)
    functionalCompetencies: {
      strategicPlanning: 0,
      organizationalLeadership: 0,
      stakeholderManagement: 0,
      financialManagement: 0,
      policyDevelopment: 0
    },
    // Core Competencies (weight: 0.3, max: 99)
    coreCompetencies: {
      communication: 0,
      decisionMaking: 0,
      innovation: 0,
      teamBuilding: 0,
      problemSolving: 0,
      adaptability: 0,
      integrity: 0,
      vision: 0,
      execution: 0,
      relationshipBuilding: 0
    },
    // Goals/Projects (weight: 0.2, max: 12)
    goals: [
      { description: '', target: '', achievement: 0 },
      { description: '', target: '', achievement: 0 },
      { description: '', target: '', achievement: 0 }
    ]
  });

  const updateFunctionalCompetency = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      functionalCompetencies: {
        ...prev.functionalCompetencies,
        [field]: value
      }
    }));
  };

  const updateCoreCompetency = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      coreCompetencies: {
        ...prev.coreCompetencies,
        [field]: value
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

  const calculateScores = () => {
    // Functional Competencies (weight: 0.5, max: 117)
    const functionalTotal = Object.values(formData.functionalCompetencies)
      .reduce((sum, score) => sum + score, 0);
    const functionalWeighted = (functionalTotal / 117) * 0.5;

    // Core Competencies (weight: 0.3, max: 99)
    const coreTotal = Object.values(formData.coreCompetencies)
      .reduce((sum, score) => sum + score, 0);
    const coreWeighted = (coreTotal / 99) * 0.3;

    // Goals/Projects (weight: 0.2, max: 12)
    const goalsTotal = formData.goals.reduce((sum, goal) => sum + goal.achievement, 0);
    const goalsWeighted = (goalsTotal / 12) * 0.2;

    const totalWeightedScore = functionalWeighted + coreWeighted + goalsWeighted;

    let finalRating = '';
    if (totalWeightedScore >= 0.90) finalRating = 'Outstanding';
    else if (totalWeightedScore >= 0.70) finalRating = 'Very Good';
    else if (totalWeightedScore >= 0.56) finalRating = 'Good';
    else if (totalWeightedScore >= 0.40) finalRating = 'Fair';
    else finalRating = 'Unsatisfactory';

    return {
      functionalTotal,
      coreTotal,
      goalsTotal,
      functionalWeighted,
      coreWeighted,
      goalsWeighted,
      totalWeightedScore,
      finalRating
    };
  };

  const calculatedScores = calculateScores();

  const handleSave = () => {
    onSave({
      template: 'EXECUTIVE_MANAGEMENT',
      formData,
      scores: calculatedScores
    });
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Executive Management Appraisal Form</h2>
      
      {/* Functional Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 1: Functional Competencies (Weight: 50%, Max Score: 117)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strategic Planning (0-25)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              value={formData.functionalCompetencies.strategicPlanning}
              onChange={(e) => updateFunctionalCompetency('strategicPlanning', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizational Leadership (0-25)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              value={formData.functionalCompetencies.organizationalLeadership}
              onChange={(e) => updateFunctionalCompetency('organizationalLeadership', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stakeholder Management (0-25)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              value={formData.functionalCompetencies.stakeholderManagement}
              onChange={(e) => updateFunctionalCompetency('stakeholderManagement', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financial Management (0-25)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              value={formData.functionalCompetencies.financialManagement}
              onChange={(e) => updateFunctionalCompetency('financialManagement', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Development (0-17)
            </label>
            <input
              type="number"
              min="0"
              max="17"
              value={formData.functionalCompetencies.policyDevelopment}
              onChange={(e) => updateFunctionalCompetency('policyDevelopment', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Functional Competencies Total:</strong> {calculatedScores.functionalTotal}/117 
            <span className="ml-2 text-purple-600">({(calculatedScores.functionalTotal/117*100).toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* Core Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 2: Core Competencies (Weight: 30%, Max Score: 99)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData.coreCompetencies).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} (0-9.9)
              </label>
              <input
                type="number"
                min="0"
                max="9.9"
                step="0.1"
                value={value}
                onChange={(e) => updateCoreCompetency(key, parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Core Competencies Total:</strong> {calculatedScores.coreTotal.toFixed(1)}/99 
            <span className="ml-2 text-purple-600">({(calculatedScores.coreTotal/99*100).toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* Goals/Projects Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 3: Goals/Projects (Weight: 20%, Max Score: 12)
        </h3>
        
        <div className="space-y-4">
          {formData.goals.map((goal, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Goal {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={goal.description}
                    onChange={(e) => updateGoal(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Goal description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target
                  </label>
                  <input
                    type="text"
                    value={goal.target}
                    onChange={(e) => updateGoal(index, 'target', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Target achievement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Achievement (0-4)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={goal.achievement}
                    onChange={(e) => updateGoal(index, 'achievement', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Goals Total:</strong> {calculatedScores.goalsTotal}/12 
            <span className="ml-2 text-purple-600">({(calculatedScores.goalsTotal/12*100).toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* Final Score Display */}
      <div className="mb-8 p-6 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-xl font-semibold text-purple-900 mb-4">Final Score Calculation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Functional (50%)</p>
            <p className="text-2xl font-bold text-purple-600">{calculatedScores.functionalWeighted.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Core (30%)</p>
            <p className="text-2xl font-bold text-purple-600">{calculatedScores.coreWeighted.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Goals (20%)</p>
            <p className="text-2xl font-bold text-purple-600">{calculatedScores.goalsWeighted.toFixed(3)}</p>
          </div>
        </div>
        <div className="text-center border-t border-purple-200 pt-4">
          <p className="text-lg font-semibold text-gray-700">Total Weighted Score</p>
          <p className="text-3xl font-bold text-purple-600">{calculatedScores.totalWeightedScore.toFixed(3)}</p>
          <p className="text-lg font-semibold text-purple-800 mt-2">{calculatedScores.finalRating}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Appraisal</Button>
      </div>
    </div>
  );
}

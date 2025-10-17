import React, { useState } from 'react';
import { Button } from '../../components/ui/button';

interface GeneralStaffAppraisalFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function GeneralStaffAppraisalForm({ onSave, onCancel }: GeneralStaffAppraisalFormProps) {
  const [formData, setFormData] = useState({
    // Functional Competencies (weight: 0.6, max: 90)
    functionalCompetencies: {
      jobKnowledge: 0,
      qualityOfWork: 0,
      productivity: 0,
      initiative: 0,
      problemSolving: 0,
      communication: 0
    },
    // Core Competencies (weight: 0.3, max: 60)
    coreCompetencies: {
      teamwork: 0,
      reliability: 0,
      adaptability: 0,
      customerService: 0,
      timeManagement: 0,
      professionalDevelopment: 0
    },
    // Goals/Projects (weight: 0.1, max: 12)
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
    // Functional Competencies (weight: 0.6, max: 90)
    const functionalTotal = Object.values(formData.functionalCompetencies)
      .reduce((sum, score) => sum + score, 0);
    const functionalWeighted = (functionalTotal / 90) * 0.6;

    // Core Competencies (weight: 0.3, max: 60)
    const coreTotal = Object.values(formData.coreCompetencies)
      .reduce((sum, score) => sum + score, 0);
    const coreWeighted = (coreTotal / 60) * 0.3;

    // Goals/Projects (weight: 0.1, max: 12)
    const goalsTotal = formData.goals.reduce((sum, goal) => sum + goal.achievement, 0);
    const goalsWeighted = (goalsTotal / 12) * 0.1;

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
      template: 'GENERAL_STAFF',
      formData,
      scores: calculatedScores
    });
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">General Staff Appraisal Form</h2>
      
      {/* Functional Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 1: Functional Competencies (Weight: 60%, Max Score: 90)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Knowledge (1-3)
            </label>
            <select
              value={formData.functionalCompetencies.jobKnowledge}
              onChange={(e) => updateFunctionalCompetency('jobKnowledge', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality of Work (1-3)
            </label>
            <select
              value={formData.functionalCompetencies.qualityOfWork}
              onChange={(e) => updateFunctionalCompetency('qualityOfWork', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Productivity (1-3)
            </label>
            <select
              value={formData.functionalCompetencies.productivity}
              onChange={(e) => updateFunctionalCompetency('productivity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initiative (1-3)
            </label>
            <select
              value={formData.functionalCompetencies.initiative}
              onChange={(e) => updateFunctionalCompetency('initiative', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Solving (1-3)
            </label>
            <select
              value={formData.functionalCompetencies.problemSolving}
              onChange={(e) => updateFunctionalCompetency('problemSolving', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication (1-3)
            </label>
            <select
              value={formData.functionalCompetencies.communication}
              onChange={(e) => updateFunctionalCompetency('communication', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Functional Competencies Total:</strong> {calculatedScores.functionalTotal}/90 
            <span className="ml-2 text-purple-600">({(calculatedScores.functionalTotal/90*100).toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* Core Competencies Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 2: Core Competencies (Weight: 30%, Max Score: 60)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teamwork (1-3)
            </label>
            <select
              value={formData.coreCompetencies.teamwork}
              onChange={(e) => updateCoreCompetency('teamwork', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reliability (1-3)
            </label>
            <select
              value={formData.coreCompetencies.reliability}
              onChange={(e) => updateCoreCompetency('reliability', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adaptability (1-3)
            </label>
            <select
              value={formData.coreCompetencies.adaptability}
              onChange={(e) => updateCoreCompetency('adaptability', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Service (1-3)
            </label>
            <select
              value={formData.coreCompetencies.customerService}
              onChange={(e) => updateCoreCompetency('customerService', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Management (1-3)
            </label>
            <select
              value={formData.coreCompetencies.timeManagement}
              onChange={(e) => updateCoreCompetency('timeManagement', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Development (1-3)
            </label>
            <select
              value={formData.coreCompetencies.professionalDevelopment}
              onChange={(e) => updateCoreCompetency('professionalDevelopment', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>Select rating...</option>
              <option value={1}>1 - Needs Improvement</option>
              <option value={2}>2 - Meets Expectations</option>
              <option value={3}>3 - Exceeds Expectations</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Core Competencies Total:</strong> {calculatedScores.coreTotal}/60 
            <span className="ml-2 text-purple-600">({(calculatedScores.coreTotal/60*100).toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* Goals/Projects Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Section 3: Goals/Projects (Weight: 10%, Max Score: 12)
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
            <p className="text-sm text-gray-600">Functional (60%)</p>
            <p className="text-2xl font-bold text-purple-600">{calculatedScores.functionalWeighted.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Core (30%)</p>
            <p className="text-2xl font-bold text-purple-600">{calculatedScores.coreWeighted.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Goals (10%)</p>
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

import React, { useState } from 'react';

interface Goal {
  id: string;
  description: string;
  performanceStandard: string;
  intendedResults: string;
  targetDate: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  comments: string;
}

interface GoalSettingWorksheetProps {
  employeeId: string;
  supervisorId: string;
  cycleId: string;
  onSave: (goals: Goal[]) => void;
  initialGoals?: Goal[];
}

export function GoalSettingWorksheet({ 
  employeeId, 
  supervisorId, 
  cycleId, 
  onSave, 
  initialGoals = [] 
}: GoalSettingWorksheetProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isEmployeeView, setIsEmployeeView] = useState(true);

  const addGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      description: '',
      performanceStandard: '',
      intendedResults: '',
      targetDate: '',
      status: 'DRAFT',
      progress: 0,
      comments: ''
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, field: keyof Goal, value: string | number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleSave = () => {
    onSave(goals);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Goal Setting Worksheet</h2>
            <p className="text-gray-600">Define performance goals and standards for the appraisal period</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <button
                onClick={() => setIsEmployeeView(true)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  isEmployeeView ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Employee
              </button>
              <button
                onClick={() => setIsEmployeeView(false)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  !isEmployeeView ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Supervisor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Define 3-5 specific, measurable, achievable, relevant, and time-bound (SMART) goals</li>
          <li>• Each goal should have clear performance standards and intended results</li>
          <li>• Goals should align with departmental objectives and institutional priorities</li>
          <li>• Review and update goals regularly throughout the appraisal period</li>
        </ul>
      </div>

      {/* Goals List */}
      <div className="space-y-6">
        {goals.map((goal, index) => (
          <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Goal {index + 1}</h3>
              <div className="flex items-center space-x-2">
                <span className={getStatusBadge(goal.status)}>
                  {goal.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => removeGoal(goal.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Goal Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Description *
                </label>
                <textarea
                  value={goal.description}
                  onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Describe the specific goal to be achieved..."
                />
              </div>

              {/* Performance Standard */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Standard *
                </label>
                <textarea
                  value={goal.performanceStandard}
                  onChange={(e) => updateGoal(goal.id, 'performanceStandard', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Define how success will be measured..."
                />
              </div>

              {/* Intended Results */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intended Results *
                </label>
                <textarea
                  value={goal.intendedResults}
                  onChange={(e) => updateGoal(goal.id, 'intendedResults', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Describe the expected outcomes and impact..."
                />
              </div>

              {/* Target Date and Status */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={goal.targetDate}
                    onChange={(e) => updateGoal(goal.id, 'targetDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={goal.status}
                    onChange={(e) => updateGoal(goal.id, 'status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateGoal(goal.id, 'progress', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments & Notes
              </label>
              <textarea
                value={goal.comments}
                onChange={(e) => updateGoal(goal.id, 'comments', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={2}
                placeholder="Add any additional notes or comments..."
              />
            </div>
          </div>
        ))}

        {/* Add Goal Button */}
        <div className="text-center">
          <button
            onClick={addGoal}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center space-x-2 mx-auto"
          >
            <span>+</span>
            <span>Add New Goal</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
              <div className="text-sm text-gray-600">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {goals.filter(g => g.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {goals.filter(g => g.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={handleSave}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Save Goals
        </button>
        <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
          Submit for Review
        </button>
      </div>
    </div>
  );
}

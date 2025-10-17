import React from 'react';

export function SimpleTemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Appraisal Templates</h1>
        <p className="text-gray-600 mb-6">Manage and configure performance appraisal templates</p>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Template Management</h2>
          <p className="text-gray-600">This is a simplified version of the templates page.</p>
          <div className="mt-4">
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Create Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

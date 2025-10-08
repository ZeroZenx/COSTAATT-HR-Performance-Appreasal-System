import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Button } from '../components/ui/button';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { appraisalsApi } from '../lib/api';

export function AppraisalsPage() {
  const navigate = useNavigate();
  const { data: appraisals, isLoading } = useQuery({
    queryKey: ['appraisals'],
    queryFn: () => appraisalsApi.getAll().then(res => {
      // Handle direct response (not wrapped in data field)
      return Array.isArray(res.data) ? res.data : [];
    }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appraisals</h1>
          <p className="text-gray-600">Manage performance appraisals</p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => navigate('/appraisals/create')}
        >
          <Plus className="h-4 w-4" />
          <span>New Appraisal</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appraisals..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appraisals List */}
      <div className="grid gap-4">
        {appraisals?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appraisals found</h3>
              <p className="text-gray-500 mb-4">Get started by creating a new appraisal</p>
              <Button>Create Appraisal</Button>
            </CardContent>
          </Card>
        ) : (
          appraisals?.map((appraisal) => (
            <Card key={appraisal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {appraisal.employee?.user?.firstName} {appraisal.employee?.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {appraisal.template?.name} • {appraisal.cycle?.name}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appraisal.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        appraisal.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-800' :
                        appraisal.status === 'CLOSED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appraisal.status.replace('_', ' ')}
                      </span>
                      {appraisal.finalScore && (
                        <span className="text-sm text-gray-600">
                          Score: {appraisal.finalScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


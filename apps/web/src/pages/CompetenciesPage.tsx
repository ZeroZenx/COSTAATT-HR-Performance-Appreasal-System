import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Plus, Search, Filter, Edit, Trash2, Eye, Target, BookOpen, Users, Award, Grid3X3, List } from 'lucide-react';
import { competenciesApi } from '../lib/api';

export function CompetenciesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const { data: competencies, isLoading } = useQuery({
    queryKey: ['competencies'],
    queryFn: () => competenciesApi.getAll().then(res => {
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

  // Filter competencies based on search term and area
  const filteredCompetencies = competencies?.filter(competency => {
    const matchesSearch = !searchTerm ||
      competency.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competency.definition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competency.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = !filterArea ||
      competency.department === filterArea;

    return matchesSearch && matchesArea;
  }) || [];

  const competencyAreas = [...new Set(competencies?.map(c => c.department).filter(Boolean) || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              COSTAATT
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-blue-300 to-purple-300"></div>
            <div className="text-2xl font-bold text-red-600" style={{textShadow: '2px 2px 4px #1e40af'}}>
              COMPETENCY LIBRARY
            </div>
          </div>
          <p className="text-gray-600 italic">Transforming the Nation...One Student at a Time</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Competency</span>
        </Button>
      </div>

      {/* Mission Statement */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Mission</h3>
            <p className="text-gray-700 italic">
              "Transforming the Nation...One Student at a Time"
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Through comprehensive competency development, we empower our faculty and staff to deliver 
              exceptional education that transforms lives and builds a stronger Trinidad and Tobago.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search competencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Areas</option>
                {competencyAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                  <div className="flex border border-gray-300 rounded-md">
                    <Button
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('card')}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900">Table of Contents</CardTitle>
          <CardDescription className="text-blue-700">
            Navigate through COSTAATT's comprehensive competency framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900">Core Competencies</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Communication Skills</li>
                <li>• Leadership</li>
                <li>• Problem Solving</li>
                <li>• Teamwork</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900">Professional Skills</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Technical Expertise</li>
                <li>• Innovation</li>
                <li>• Customer Focus</li>
                <li>• Adaptability</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900">Academic Excellence</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Teaching Excellence</li>
                <li>• Research & Development</li>
                <li>• Student Mentorship</li>
                <li>• Curriculum Innovation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competency Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Competencies</p>
                <p className="text-2xl font-bold text-gray-900">{competencies?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Competency Areas</p>
                <p className="text-2xl font-bold text-gray-900">{competencyAreas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Faculty & Staff</p>
                <p className="text-2xl font-bold text-gray-900">14</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Reviews</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competencies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">COSTAATT Competency Framework</CardTitle>
          <CardDescription className="text-gray-600">
            {filteredCompetencies.length} competenc{filteredCompetencies.length !== 1 ? 'ies' : 'y'} found • 
            Comprehensive performance standards for academic excellence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCompetencies.map((competency, index) => (
              <div key={competency.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {competency.department || 'General'}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {competency.title || 'N/A'}
                      </h3>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {competency.definition || 'No description available'}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1 text-xs">Basic Behaviours</h4>
                        <p className="text-gray-600 text-xs" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {competency.behaviorsBasic || 'Not defined'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1 text-xs">Above Behaviours</h4>
                        <p className="text-gray-600 text-xs" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {competency.behaviorsAbove || 'Not defined'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1 text-xs">Outstanding Behaviours</h4>
                        <p className="text-gray-600 text-xs" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {competency.behaviorsOutstanding || 'Not defined'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedCompetency(competency)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="p-1">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Area</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Competency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Definition</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompetencies.map((competency, index) => (
                    <tr key={competency.id || index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {competency.department || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {competency.title || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-md">
                        <div className="truncate" title={competency.definition}>
                          {competency.definition || 'No description available'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedCompetency(competency)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredCompetencies.length === 0 && (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No competencies found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterArea 
                  ? 'Try adjusting your search criteria.' 
                  : 'Get started by adding your first competency.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competency Detail Modal would go here */}
      {selectedCompetency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedCompetency.title}</CardTitle>
              <CardDescription>{selectedCompetency.department} • {selectedCompetency.cluster || 'CORE'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Definition</h4>
                <p className="text-sm text-gray-600">{selectedCompetency.definition}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Behaviours</h4>
                <p className="text-sm text-gray-600">{selectedCompetency.behaviorsBasic}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Above Behaviours</h4>
                <p className="text-sm text-gray-600">{selectedCompetency.behaviorsAbove}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Outstanding Behaviours</h4>
                <p className="text-sm text-gray-600">{selectedCompetency.behaviorsOutstanding}</p>
              </div>
            </CardContent>
            <div className="flex justify-end space-x-2 p-6 border-t">
              <Button variant="outline" onClick={() => setSelectedCompetency(null)}>
                Close
              </Button>
              <Button>
                Edit Competency
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


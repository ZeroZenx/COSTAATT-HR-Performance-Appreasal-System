import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { CompetencyModal } from '../components/CompetencyModal';
import { 
  Search, 
  Grid3X3, 
  List, 
  Plus, 
  BookOpen, 
  Users, 
  Target,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface Competency {
  id?: string;
  code: string;
  name: string;
  description: string;
  definition: string;
  basicBehaviours: string;
  aboveExpectationsBehaviours: string;
  outstandingBehaviours: string;
  department: string;
  jobLevel: string;
  category: string;
  clusterId: string;
  cluster?: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CompetencyCluster {
  id: string;
  name: string;
  description: string;
  category: string;
}

export function CompetenciesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: competencies, isLoading: competenciesLoading, error } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/competencies');
      if (!response.ok) {
        throw new Error('Failed to fetch competencies');
      }
      return response.json();
    }
  });

  const { data: clusters } = useQuery({
    queryKey: ['competency-clusters'],
    queryFn: async () => {
      const response = await fetch('http://10.2.1.27:3000/competency-clusters');
      if (!response.ok) {
        throw new Error('Failed to fetch competency clusters');
      }
      return response.json();
    }
  });

  // Mutations
  const createCompetencyMutation = useMutation({
    mutationFn: async (competencyData: Partial<Competency>) => {
      const response = await fetch('http://10.2.1.27:3000/competencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(competencyData),
      });
      if (!response.ok) {
        throw new Error('Failed to create competency');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
      setMessage({ type: 'success', text: 'Competency created successfully!' });
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const updateCompetencyMutation = useMutation({
    mutationFn: async ({ id, ...competencyData }: Competency) => {
      const response = await fetch(`http://10.2.1.27:3000/competencies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(competencyData),
      });
      if (!response.ok) {
        throw new Error('Failed to update competency');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
      setMessage({ type: 'success', text: 'Competency updated successfully!' });
      setIsModalOpen(false);
      setSelectedCompetency(null);
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const deleteCompetencyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://10.2.1.27:3000/competencies/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete competency');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
      setMessage({ type: 'success', text: 'Competency deleted successfully!' });
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  // Handler functions
  const handleAddCompetency = () => {
    setSelectedCompetency(null);
    setIsModalOpen(true);
  };

  const handleEditCompetency = (competency: Competency) => {
    setSelectedCompetency(competency);
    setIsModalOpen(true);
  };

  const handleViewCompetency = (competency: Competency) => {
    setSelectedCompetency(competency);
    setIsModalOpen(true);
  };

  const handleDeleteCompetency = (competency: Competency) => {
    if (window.confirm(`Are you sure you want to delete "${competency.name}"?`)) {
      if (competency.id) {
        deleteCompetencyMutation.mutate(competency.id);
      }
    }
  };

  const handleSaveCompetency = (competencyData: Competency) => {
    if (competencyData.id) {
      updateCompetencyMutation.mutate(competencyData);
    } else {
      createCompetencyMutation.mutate(competencyData);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://10.2.1.27:3000/competencies/export');
      if (!response.ok) {
        throw new Error('Failed to export competencies');
      }
      const data = await response.json();
      
      // Create download link
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || 'competencies_export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setMessage({ type: 'success', text: 'Competencies exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export competencies!' });
    }
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleFileImport = async (file: File) => {
    try {
      const text = await file.text();
      let importData;
      
      if (file.name.endsWith('.json')) {
        importData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Basic CSV parsing - you might want to use a CSV library for production
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        importData = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
            return obj;
          }, {} as any);
        });
      }
      
      const response = await fetch('http://10.2.1.27:3000/competencies/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ competencies: importData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to import competencies');
      }
      
      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
      setMessage({ type: 'success', text: result.message });
      setIsImportModalOpen(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import competencies!' });
    }
  };

  const filteredCompetencies = competencies?.filter((competency: Competency) => {
    const matchesSearch = 
      competency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competency.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competency.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCluster = selectedCluster === 'ALL' || competency.cluster?.id === selectedCluster;
    const matchesCategory = selectedCategory === 'ALL' || competency.category === selectedCategory;
    const matchesLevel = selectedLevel === 'ALL' || competency.jobLevel === selectedLevel;
    
    return matchesSearch && matchesCluster && matchesCategory && matchesLevel;
  }) || [];

  const getLevelBadge = (level: string) => {
    const styles = {
      'Basic': 'bg-blue-100 text-blue-800',
      'Intermediate': 'bg-green-100 text-green-800',
      'Advanced': 'bg-purple-100 text-purple-800',
      'Expert': 'bg-orange-100 text-orange-800'
    };
    return styles[level as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      'Personal Effectiveness and Leadership': 'bg-indigo-100 text-indigo-800',
      'Values and Guiding Principles': 'bg-emerald-100 text-emerald-800',
      'People Focus': 'bg-rose-100 text-rose-800',
      'Faculty Competencies': 'bg-blue-100 text-blue-800',
      'Administrative Competencies': 'bg-amber-100 text-amber-800'
    };
    return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const CompetencyCard = ({ competency }: { competency: Competency }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{competency.name}</CardTitle>
            <CardDescription className="text-sm mb-3">
              {competency.description}
            </CardDescription>
          </div>
          <Badge className={getLevelBadge(competency.jobLevel)}>
            {competency.jobLevel}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {competency.cluster?.name || 'No Cluster'}
          </Badge>
          <Badge className={getCategoryBadge(competency.category)}>
            {competency.category.split(' ')[0]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Code</h4>
            <p className="text-sm text-gray-600 font-mono">{competency.code}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Basic Behaviours</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {competency.basicBehaviours?.split('; ').slice(0, 2).join(' • ') || 'Not specified'}
            </p>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => handleViewCompetency(competency)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleEditCompetency(competency)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDeleteCompetency(competency)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CompetencyListItem = ({ competency }: { competency: Competency }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold">{competency.name}</h3>
              <Badge className={getLevelBadge(competency.jobLevel)}>
                {competency.jobLevel}
              </Badge>
              <Badge className={getCategoryBadge(competency.category)}>
                {competency.category.split(' ')[0]}
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">{competency.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="font-mono">{competency.code}</span>
              <span>•</span>
              <span>{competency.cluster?.name || 'No Cluster'}</span>
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleViewCompetency(competency)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleEditCompetency(competency)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDeleteCompetency(competency)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-8 sticky top-0 bg-gray-50 z-30 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Competency Library</h1>
                <p className="mt-2 text-gray-600">
                  COSTAATT's comprehensive competency framework for performance management
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleAddCompetency}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Competency
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Competencies</p>
                    <p className="text-2xl font-bold text-gray-900">{competencies?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Core Competencies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {competencies?.filter((c: Competency) => c.category?.includes('Personal Effectiveness') || c.category?.includes('Values') || c.category?.includes('People')).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Faculty Competencies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {competencies?.filter((c: Competency) => c.category?.includes('Faculty')).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Admin Competencies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {competencies?.filter((c: Competency) => c.category?.includes('Administrative')).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
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
                <div className="flex gap-4">
                  <select
                    value={selectedCluster}
                    onChange={(e) => setSelectedCluster(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ALL">All Clusters</option>
                    {clusters?.map((cluster: CompetencyCluster) => (
                      <option key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Personal Effectiveness and Leadership">Personal Effectiveness</option>
                    <option value="Values and Guiding Principles">Values & Principles</option>
                    <option value="People Focus">People Focus</option>
                    <option value="Faculty Competencies">Faculty</option>
                    <option value="Administrative Competencies">Administrative</option>
                  </select>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Toggle and Results */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Showing {filteredCompetencies.length} of {competencies?.length || 0} competencies
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {competenciesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading competencies...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <p className="text-lg font-semibold">Error loading competencies</p>
                    <p className="text-sm">{error.message}</p>
                  </div>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : filteredCompetencies.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No competencies found matching your criteria.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompetencies.map((competency: Competency) => (
                    <CompetencyCard key={competency.id} competency={competency} />
                  ))}
                </div>
              ) : (
                <div>
                  {filteredCompetencies.map((competency: Competency) => (
                    <CompetencyListItem key={competency.id} competency={competency} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg border shadow-lg z-50 ${
          message.type === 'success' 
            ? 'border-green-200 bg-green-50 text-green-800' 
            : message.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-blue-200 bg-blue-50 text-blue-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.text}
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2"
              onClick={() => setMessage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Competency Modal */}
      <CompetencyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCompetency(null);
        }}
        competency={selectedCompetency}
        clusters={clusters || []}
        onSave={(competencyData: any) => handleSaveCompetency(competencyData)}
        isLoading={createCompetencyMutation.isPending || updateCompetencyMutation.isPending}
      />

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Import Competencies</h3>
            <p className="text-gray-600 mb-4">
              Select a JSON or CSV file to import competencies.
            </p>
            <input
              type="file"
              accept=".json,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileImport(file);
                }
              }}
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
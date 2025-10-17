import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Calendar, CheckCircle, Clock, AlertCircle, Users, Target, FileText } from 'lucide-react';

interface AppraisalCycleManagerProps {
  employeeId: string;
  cycleId: string;
  templateType: 'GENERAL_STAFF' | 'FACULTY' | 'DEAN' | 'CLINICAL_INSTRUCTOR' | 'EXECUTIVE_MANAGEMENT';
}

interface CycleStage {
  id: string;
  name: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  startDate: string;
  endDate: string;
  progress: number;
  requiredFields: string[];
  completedFields: string[];
}

interface AppraisalCycleData {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  stages: CycleStage[];
  currentStage: string;
  overallProgress: number;
}

export function AppraisalCycleManager({ employeeId, cycleId, templateType }: AppraisalCycleManagerProps) {
  const [currentStage, setCurrentStage] = useState('PLANNING');
  const [cycleData, setCycleData] = useState<AppraisalCycleData | null>(null);
  const queryClient = useQueryClient();

  // Fetch cycle data
  const { data: cycle, isLoading: cycleLoading } = useQuery({
    queryKey: ['cycle', cycleId],
    queryFn: async () => {
      const response = await fetch(`http://10.2.1.27:3000/cycles/${cycleId}`);
      return response.json();
    }
  });

  // Fetch appraisal data
  const { data: appraisal, isLoading: appraisalLoading } = useQuery({
    queryKey: ['appraisal', employeeId, cycleId, templateType],
    queryFn: async () => {
      const response = await fetch(`http://10.2.1.27:3000/appraisals?employeeId=${employeeId}&cycleId=${cycleId}&templateType=${templateType}`);
      return response.json();
    }
  });

  // Initialize cycle data
  useEffect(() => {
    if (cycle) {
      const stages: CycleStage[] = [
        {
          id: 'PLANNING',
          name: 'Planning Phase',
          description: 'Goal setting and expectation alignment',
          status: 'NOT_STARTED',
          startDate: cycle.startDate,
          endDate: new Date(new Date(cycle.startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          requiredFields: ['goals', 'expectations', 'developmentPlan'],
          completedFields: []
        },
        {
          id: 'MID_YEAR',
          name: 'Mid-Year Review',
          description: 'Progress check-in and feedback',
          status: 'NOT_STARTED',
          startDate: new Date(new Date(cycle.startDate).getTime() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(new Date(cycle.startDate).getTime() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          requiredFields: ['progressReview', 'feedback', 'adjustments'],
          completedFields: []
        },
        {
          id: 'FINAL',
          name: 'Final Appraisal',
          description: 'Comprehensive performance evaluation',
          status: 'NOT_STARTED',
          startDate: new Date(new Date(cycle.startDate).getTime() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: cycle.endDate,
          progress: 0,
          requiredFields: ['performanceEvaluation', 'scoring', 'developmentRecommendations'],
          completedFields: []
        }
      ];

      setCycleData({
        id: cycle.id,
        name: cycle.name,
        description: cycle.description || '',
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        status: cycle.status,
        stages,
        currentStage: 'PLANNING',
        overallProgress: 0
      });
    }
  }, [cycle]);

  // Update stage progress
  const updateStageProgress = (stageId: string, progress: number) => {
    if (cycleData) {
      setCycleData(prev => ({
        ...prev!,
        stages: prev!.stages.map(stage => 
          stage.id === stageId 
            ? { ...stage, progress, status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS' }
            : stage
        ),
        currentStage: stageId
      }));
    }
  };

  // Move to next stage
  const moveToNextStage = () => {
    if (cycleData) {
      const currentIndex = cycleData.stages.findIndex(stage => stage.id === currentStage);
      if (currentIndex < cycleData.stages.length - 1) {
        const nextStage = cycleData.stages[currentIndex + 1];
        setCurrentStage(nextStage.id);
        updateStageProgress(nextStage.id, 0);
      }
    }
  };

  // Complete current stage
  const completeCurrentStage = () => {
    updateStageProgress(currentStage, 100);
    moveToNextStage();
  };

  // Get stage status icon
  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get stage status color
  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (cycleLoading || appraisalLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Cycle Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-6 h-6" />
            <span>{cycleData?.name}</span>
          </CardTitle>
          <CardDescription>
            {cycleData?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cycleData?.stages.filter(s => s.status === 'COMPLETED').length || 0}
              </div>
              <div className="text-sm text-gray-500">Completed Stages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {cycleData?.overallProgress || 0}%
              </div>
              <div className="text-sm text-gray-500">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {cycleData?.stages.length || 0}
              </div>
              <div className="text-sm text-gray-500">Total Stages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Navigation */}
      <Tabs value={currentStage} onValueChange={setCurrentStage}>
        <TabsList className="grid w-full grid-cols-3">
          {cycleData?.stages.map((stage) => (
            <TabsTrigger key={stage.id} value={stage.id} className="flex items-center space-x-2">
              {getStageStatusIcon(stage.status)}
              <span>{stage.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Planning Phase */}
        <TabsContent value="PLANNING">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Planning Phase</span>
                <Badge className={getStageStatusColor(cycleData?.stages.find(s => s.id === 'PLANNING')?.status || 'NOT_STARTED')}>
                  {cycleData?.stages.find(s => s.id === 'PLANNING')?.status || 'NOT_STARTED'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Set goals, expectations, and development plans for the appraisal period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">
                    {cycleData?.stages.find(s => s.id === 'PLANNING')?.progress || 0}%
                  </span>
                </div>
                <Progress value={cycleData?.stages.find(s => s.id === 'PLANNING')?.progress || 0} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Goal Setting</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Performance objectives</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Development goals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Key deliverables</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Expectations</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Role responsibilities</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Performance standards</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Success metrics</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button onClick={completeCurrentStage}>Complete Planning</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mid-Year Review */}
        <TabsContent value="MID_YEAR">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Mid-Year Review</span>
                <Badge className={getStageStatusColor(cycleData?.stages.find(s => s.id === 'MID_YEAR')?.status || 'NOT_STARTED')}>
                  {cycleData?.stages.find(s => s.id === 'MID_YEAR')?.status || 'NOT_STARTED'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Review progress, provide feedback, and make necessary adjustments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">
                    {cycleData?.stages.find(s => s.id === 'MID_YEAR')?.progress || 0}%
                  </span>
                </div>
                <Progress value={cycleData?.stages.find(s => s.id === 'MID_YEAR')?.progress || 0} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Progress Review</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Goal achievement</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Performance indicators</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Challenges faced</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Feedback & Adjustments</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Supervisor feedback</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Goal adjustments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Support needed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button onClick={completeCurrentStage}>Complete Mid-Year Review</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Final Appraisal */}
        <TabsContent value="FINAL">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Final Appraisal</span>
                <Badge className={getStageStatusColor(cycleData?.stages.find(s => s.id === 'FINAL')?.status || 'NOT_STARTED')}>
                  {cycleData?.stages.find(s => s.id === 'FINAL')?.status || 'NOT_STARTED'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Comprehensive performance evaluation and final assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">
                    {cycleData?.stages.find(s => s.id === 'FINAL')?.progress || 0}%
                  </span>
                </div>
                <Progress value={cycleData?.stages.find(s => s.id === 'FINAL')?.progress || 0} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Evaluation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Competency assessment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Goal achievement</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Overall rating</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Development & Next Steps</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Development recommendations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Career planning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Next cycle goals</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button onClick={completeCurrentStage}>Complete Final Appraisal</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

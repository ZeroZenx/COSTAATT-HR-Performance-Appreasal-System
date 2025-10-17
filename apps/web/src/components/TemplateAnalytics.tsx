import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Star, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface TemplateAnalyticsProps {
  template: any;
}

export function TemplateAnalytics({ template }: TemplateAnalyticsProps) {
  // Mock analytics data - in a real app, this would come from the API
  const analytics = {
    totalUses: 47,
    avgRating: 4.2,
    completionRate: 87,
    avgCompletionTime: '2.5 hours',
    lastUsed: '2 days ago',
    usageByMonth: [
      { month: 'Jan', uses: 12 },
      { month: 'Feb', uses: 18 },
      { month: 'Mar', uses: 15 },
      { month: 'Apr', uses: 22 },
      { month: 'May', uses: 19 },
      { month: 'Jun', uses: 25 }
    ],
    ratings: [
      { rating: 5, count: 23 },
      { rating: 4, count: 15 },
      { rating: 3, count: 6 },
      { rating: 2, count: 2 },
      { rating: 1, count: 1 }
    ],
    departments: [
      { name: 'Technology Services', uses: 18 },
      { name: 'Academic Affairs', uses: 12 },
      { name: 'Student Services', uses: 8 },
      { name: 'Administration', uses: 5 },
      { name: 'Finance', uses: 4 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUses}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgRating}</div>
            <p className="text-xs text-muted-foreground">
              Based on {analytics.ratings.reduce((sum, r) => sum + r.count, 0)} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgCompletionTime}</div>
            <p className="text-xs text-muted-foreground">
              Last used {analytics.lastUsed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>Template usage over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.usageByMonth.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium w-12">{month.month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(month.uses / 25) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8">{month.uses}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>User ratings for this template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.ratings.map((rating) => (
              <div key={rating.rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${(rating.count / 23) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{rating.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Department</CardTitle>
          <CardDescription>Which departments use this template most</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.departments.map((dept, index) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{dept.name}</Badge>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(dept.uses / 18) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8">{dept.uses}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Export Analytics</CardTitle>
          <CardDescription>Download detailed analytics report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

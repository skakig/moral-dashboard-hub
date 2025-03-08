
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

// For the pie chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface APIUsageStatsProps {
  usageStats: {
    byService: Record<string, any>;
    byCategory: Record<string, any>;
  };
  onRefresh?: () => void;
}

export function APIUsageStats({ usageStats, onRefresh }: APIUsageStatsProps) {
  // Prepare data for charts
  const serviceData = Object.entries(usageStats.byService || {}).map(([name, stats]: [string, any]) => ({
    name,
    calls: stats.totalCalls || 0,
    successRate: stats.totalCalls ? (stats.successfulCalls / stats.totalCalls) * 100 : 0,
    avgResponseTime: stats.avgResponseTime || 0
  }));

  const categoryData = Object.entries(usageStats.byCategory || {}).map(([name, stats]: [string, any]) => ({
    name,
    value: stats.totalCalls || 0
  }));

  const hasData = serviceData.length > 0 || categoryData.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">API Usage Statistics</h3>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {!hasData ? (
        <Card>
          <CardHeader>
            <CardTitle>No Usage Data Available</CardTitle>
            <CardDescription>
              Usage statistics will appear after API calls are made
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <p className="text-muted-foreground">Start using AI services to see usage statistics</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Calls by Service</CardTitle>
                <CardDescription>
                  Number of API calls made per service
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calls" fill="#8884d8" name="Total Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Calls by Category</CardTitle>
                <CardDescription>
                  Distribution of API calls across categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} calls`, 'Usage']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Success Rate</CardTitle>
                <CardDescription>
                  Percentage of successful API calls
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => {
                        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                        return [`${numValue.toFixed(1)}%`, 'Success Rate'];
                      }} 
                    />
                    <Bar dataKey="successRate" fill="#82ca9d" name="Success Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Response Time</CardTitle>
                <CardDescription>
                  Average response time per service (ms)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => {
                        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                        return [`${numValue.toFixed(0)} ms`, 'Response Time'];
                      }}
                    />
                    <Bar dataKey="avgResponseTime" fill="#8884d8" name="Avg Response Time (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

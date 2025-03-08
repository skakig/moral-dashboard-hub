
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

// Mock data
const accuracyTrendData = [
  { month: "Jan", accuracy: 68 },
  { month: "Feb", accuracy: 72 },
  { month: "Mar", accuracy: 75 },
  { month: "Apr", accuracy: 78 },
  { month: "May", accuracy: 81 },
  { month: "Jun", accuracy: 83 },
  { month: "Jul", accuracy: 85 },
  { month: "Aug", accuracy: 87 },
];

const confusionData = [
  { predicted: "Level 1-3", actual: "Level 1-3", value: 92 },
  { predicted: "Level 1-3", actual: "Level 4-6", value: 7 },
  { predicted: "Level 1-3", actual: "Level 7-9", value: 1 },
  { predicted: "Level 4-6", actual: "Level 1-3", value: 9 },
  { predicted: "Level 4-6", actual: "Level 4-6", value: 85 },
  { predicted: "Level 4-6", actual: "Level 7-9", value: 6 },
  { predicted: "Level 7-9", actual: "Level 1-3", value: 2 },
  { predicted: "Level 7-9", actual: "Level 4-6", value: 8 },
  { predicted: "Level 7-9", actual: "Level 7-9", value: 76 },
];

const predictionDistribution = [
  { name: "Correct", value: 87 },
  { name: "Off by 1 Level", value: 9 },
  { name: "Off by 2+ Levels", value: 4 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))"];

export default function AIInsights() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-muted-foreground">
              Analyze AI model performance and prediction accuracy
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
            <TabsTrigger value="training">Training Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Accuracy Trend</CardTitle>
                  <CardDescription>AI prediction accuracy over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={accuracyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="month" />
                        <YAxis domain={[60, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prediction Distribution</CardTitle>
                  <CardDescription>Accuracy of AI moral level predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={predictionDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {predictionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="accuracy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Confusion Matrix</CardTitle>
                <CardDescription>Analysis of prediction errors by moral level group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={confusionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="predicted" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Accuracy %" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Data Management</CardTitle>
                <CardDescription>Review and modify AI training datasets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 items-center justify-center py-12">
                  <p className="text-center text-muted-foreground">
                    Training data management UI will be implemented in the next phase.
                    <br />
                    This will include data review, manual corrections, and export functionality.
                  </p>
                  <Button>Export Current Dataset</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

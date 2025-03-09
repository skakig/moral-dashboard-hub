
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  getAgeRangeDistribution,
  getGenderMoralDistribution,
  getAnalyticsSummary
} from "@/services/analyticsService";

const COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", // Blues
  "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", // Purples
  "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", // Greens
];

export function DemographicsOverview() {
  const [ageData, setAgeData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch age range distribution
        const ageRanges = await getAgeRangeDistribution();
        setAgeData(ageRanges || []);
        
        // Fetch gender data
        const genderMoral = await getGenderMoralDistribution();
        
        // Process gender data
        const maleCounts = {};
        const femaleCounts = {};
        
        // Initialize the counts
        for (let i = 1; i <= 9; i++) {
          maleCounts[i] = 0;
          femaleCounts[i] = 0;
        }
        
        // Fill in actual data
        genderMoral?.forEach(item => {
          if (item.gender === 'Male') {
            maleCounts[item.moral_level] = item.user_count;
          } else if (item.gender === 'Female') {
            femaleCounts[item.moral_level] = item.user_count;
          }
        });
        
        // Create array for chart
        const processedGenderData = [];
        for (let i = 1; i <= 9; i++) {
          processedGenderData.push({
            moral_level: `Level ${i}`,
            Male: maleCounts[i],
            Female: femaleCounts[i]
          });
        }
        
        setGenderData(processedGenderData);
        
        // Fetch summary analytics
        const analyticsSummary = await getAnalyticsSummary();
        setSummary(analyticsSummary || {});
      } catch (err: any) {
        console.error("Error fetching analytics data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  if (error) {
    return <div>Error loading analytics: {error}</div>;
  }

  // Transform age data for pie chart
  const agePieData = ageData.map(item => ({
    name: item.age_range,
    value: Number(item.user_count)
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Demographics Overview</CardTitle>
        <CardDescription>
          Demographic breakdown of TMH users and their moral levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="age">
          <TabsList className="mb-4">
            <TabsTrigger value="age">Age Distribution</TabsTrigger>
            <TabsTrigger value="gender">Gender by Moral Level</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="age" className="space-y-4">
            <div className="flex h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {agePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="age_range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                  <Bar dataKey="user_count" fill="hsl(var(--primary))" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="gender">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="moral_level" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Male" fill="#3b82f6" name="Male" />
                  <Bar dataKey="Female" fill="#ec4899" name="Female" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">User Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt>Total Users:</dt>
                      <dd className="font-medium">{summary?.total_users || 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Influencers:</dt>
                      <dd className="font-medium">{summary?.total_influencers || 0}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt>Avg. Moral Level:</dt>
                      <dd className="font-medium">{(summary?.average_moral_level || 0).toFixed(1)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Avg. Engagement:</dt>
                      <dd className="font-medium">{(summary?.average_engagement || 0).toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Conversion Rate:</dt>
                      <dd className="font-medium">{((summary?.average_conversion_rate || 0) * 100).toFixed(1)}%</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

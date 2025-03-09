
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', level1: 400, level2: 240, level3: 200, level4: 180, level5: 50, level6: 20, level7: 10, level8: 5, level9: 2 },
  { month: 'Feb', level1: 380, level2: 250, level3: 210, level4: 190, level5: 55, level6: 22, level7: 12, level8: 6, level9: 2 },
  { month: 'Mar', level1: 370, level2: 260, level3: 220, level4: 200, level5: 60, level6: 25, level7: 14, level8: 7, level9: 3 },
  { month: 'Apr', level1: 360, level2: 270, level3: 230, level4: 210, level5: 65, level6: 28, level7: 16, level8: 8, level9: 3 },
  { month: 'May', level1: 350, level2: 280, level3: 240, level4: 220, level5: 70, level6: 30, level7: 18, level8: 9, level9: 4 },
  { month: 'Jun', level1: 340, level2: 290, level3: 250, level4: 230, level5: 75, level6: 32, level7: 20, level8: 10, level9: 4 },
];

export default function Trends() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moral Hierarchy Trends</h1>
          <p className="text-muted-foreground">
            Analyze trends and patterns in moral development over time
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Moral Level Distribution Trends</CardTitle>
            <CardDescription>
              Monthly distribution of users across the 9 levels of the moral hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="level1" stroke="#FF6B6B" name="Level 1" />
                  <Line type="monotone" dataKey="level2" stroke="#FF9E40" name="Level 2" />
                  <Line type="monotone" dataKey="level3" stroke="#FAD02E" name="Level 3" />
                  <Line type="monotone" dataKey="level4" stroke="#A0C15A" name="Level 4" />
                  <Line type="monotone" dataKey="level5" stroke="#36A2EB" name="Level 5" />
                  <Line type="monotone" dataKey="level6" stroke="#4C6EF5" name="Level 6" />
                  <Line type="monotone" dataKey="level7" stroke="#9C36B5" name="Level 7" />
                  <Line type="monotone" dataKey="level8" stroke="#633231" name="Level 8" />
                  <Line type="monotone" dataKey="level9" stroke="#1E1F22" name="Level 9" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Growth Rate Analysis</CardTitle>
              <CardDescription>
                Rate of progression through moral hierarchy levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Data visualization coming soon...
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Regression Patterns</CardTitle>
              <CardDescription>
                Analysis of cases where users move down the hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Data visualization coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

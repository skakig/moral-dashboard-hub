
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for moral level distribution
const data = [
  { level: "Level 1", count: 42 },
  { level: "Level 2", count: 78 },
  { level: "Level 3", count: 129 },
  { level: "Level 4", count: 187 },
  { level: "Level 5", count: 215 },
  { level: "Level 6", count: 145 },
  { level: "Level 7", count: 87 },
  { level: "Level 8", count: 35 },
  { level: "Level 9", count: 12 },
];

export function MoralLevelChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>User Moral Level Distribution</CardTitle>
        <CardDescription>
          Number of users classified at each moral level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

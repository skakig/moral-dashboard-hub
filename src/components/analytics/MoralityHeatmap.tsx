
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCountryMoralDistribution } from "@/services/analyticsService";

const colorScale = [
  "#cce5ff", // Lightest blue (lowest level)
  "#99ccff",
  "#66b2ff",
  "#3399ff",
  "#0080ff",
  "#0066cc",
  "#004d99",
  "#003366",
  "#001a33"  // Darkest blue (highest level)
];

function getColorForValue(value: number): string {
  // Map value between 1-9 to color scale index
  const index = Math.min(Math.max(Math.floor(value) - 1, 0), 8);
  return colorScale[index];
}

export function MoralityHeatmap() {
  const [countryData, setCountryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = getCountryMoralDistribution();
        setCountryData(data || []);
      } catch (err: any) {
        console.error("Error fetching country data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading heatmap data...</div>;
  }

  if (error) {
    return <div>Error loading heatmap: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Moral Level Heatmap</CardTitle>
        <CardDescription>
          Average moral level distribution by country
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Avg. Moral Level</th>
                <th className="py-3 px-4">Users</th>
                <th className="py-3 px-4">Visual</th>
              </tr>
            </thead>
            <tbody>
              {countryData.map((country, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{country.country}</td>
                  <td className="py-3 px-4">{Number(country.avg_moral_level).toFixed(1)}</td>
                  <td className="py-3 px-4">{country.user_count}</td>
                  <td className="py-3 px-4">
                    <div 
                      className="w-full h-6 rounded" 
                      style={{ 
                        backgroundColor: getColorForValue(country.avg_moral_level),
                        width: `${Math.min(country.user_count, 100)}%`,
                        minWidth: '40px'
                      }}
                    />
                  </td>
                </tr>
              ))}
              {countryData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-center">No country data available yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-1">
            <span className="text-xs">Level 1</span>
            <div className="flex">
              {colorScale.map((color, i) => (
                <div 
                  key={i} 
                  className="w-6 h-4"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-xs">Level 9</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

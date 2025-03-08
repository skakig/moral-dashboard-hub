
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function AIAccuracyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Prediction Accuracy</CardTitle>
        <CardDescription>Current model performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Accuracy</span>
              <span className="text-sm font-medium">87%</span>
            </div>
            <Progress value={87} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Lower Levels (1-3)</span>
              <span className="text-sm font-medium">92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Middle Levels (4-6)</span>
              <span className="text-sm font-medium">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Higher Levels (7-9)</span>
              <span className="text-sm font-medium">76%</span>
            </div>
            <Progress value={76} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

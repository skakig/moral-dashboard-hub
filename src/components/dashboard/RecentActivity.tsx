
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserPlus, BarChart2, Settings } from "lucide-react";

// Mock activity data
const activities = [
  {
    id: 1,
    action: "New user registered",
    subject: "John Doe",
    time: "10 minutes ago",
    icon: UserPlus,
  },
  {
    id: 2,
    action: "Assessment modified",
    subject: "Moral Dilemma #34",
    time: "2 hours ago",
    icon: FileText,
  },
  {
    id: 3,
    action: "AI model updated",
    subject: "Moral Level Predictor",
    time: "Yesterday at 4:30 PM",
    icon: BarChart2,
  },
  {
    id: 4,
    action: "System settings changed",
    subject: "API Configuration",
    time: "2 days ago",
    icon: Settings,
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="bg-secondary p-2 rounded-full">
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.action}
                </p>
                <p className="text-sm text-muted-foreground">{activity.subject}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

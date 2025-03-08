
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MoralLevelChart } from "@/components/dashboard/MoralLevelChart";
import { AIAccuracyCard } from "@/components/dashboard/AIAccuracyCard";
import { Users, FileText, Brain, RefreshCw } from "lucide-react";

export default function Index() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of The Moral Hierarchy system performance and metrics
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value="2,843"
            icon={<Users className="h-4 w-4" />}
            description="This month"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Assessments"
            value="143"
            icon={<FileText className="h-4 w-4" />}
            description="Last 7 days"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="AI Predictions"
            value="1,285"
            icon={<Brain className="h-4 w-4" />}
            description="Last 30 days"
            trend={{ value: 24, isPositive: true }}
          />
          <StatCard
            title="Average Response Time"
            value="1.4s"
            icon={<RefreshCw className="h-4 w-4" />}
            description="API latency"
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MoralLevelChart />
          <div className="space-y-4 lg:col-span-1">
            <AIAccuracyCard />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

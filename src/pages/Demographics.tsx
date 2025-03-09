
import { AppLayout } from "@/components/layout/AppLayout";
import { MoralityHeatmap } from "@/components/analytics/MoralityHeatmap";
import { DemographicsOverview } from "@/components/analytics/DemographicsOverview";

export default function Demographics() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demographics</h1>
          <p className="text-muted-foreground">
            Analyze user demographics and moral level distribution
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DemographicsOverview />
          <div className="lg:col-span-1">
            <MoralityHeatmap />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

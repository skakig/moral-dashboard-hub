
import { AppLayout } from "@/components/layout/AppLayout";
import { DemographicForm } from "@/components/demographics/DemographicForm";

export default function UserProfile() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            Update your personal information and preferences
          </p>
        </div>

        <div className="max-w-2xl">
          <DemographicForm />
        </div>
      </div>
    </AppLayout>
  );
}

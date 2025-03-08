
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function NotificationSettings() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Mock API call
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved", {
        description: "Your changes have been successfully saved",
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure admin notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="new-user">New User Registration</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when new users register
            </p>
          </div>
          <Switch id="new-user" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="completed-assessment">Completed Assessments</Label>
            <p className="text-sm text-muted-foreground">
              Notify when users complete moral assessments
            </p>
          </div>
          <Switch id="completed-assessment" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ai-errors">AI Model Errors</Label>
            <p className="text-sm text-muted-foreground">
              Get alerted for AI prediction errors or anomalies
            </p>
          </div>
          <Switch id="ai-errors" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="system-updates">System Updates</Label>
            <p className="text-sm text-muted-foreground">
              Notifications about system updates and maintenance
            </p>
          </div>
          <Switch id="system-updates" defaultChecked />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

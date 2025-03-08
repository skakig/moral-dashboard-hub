
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function GeneralSettings() {
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
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Manage system-wide settings for TMH
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="site-name">Site Name</Label>
          <Input id="site-name" defaultValue="The Moral Hierarchy" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Admin Email</Label>
          <Input id="admin-email" defaultValue="admin@tmh.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select defaultValue="utc">
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">UTC</SelectItem>
              <SelectItem value="est">Eastern Time (EST)</SelectItem>
              <SelectItem value="pst">Pacific Time (PST)</SelectItem>
              <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">
              Put the site in maintenance mode
            </p>
          </div>
          <Switch id="maintenance-mode" />
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


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  id: string;
  site_name: string;
  admin_email: string;
  timezone: string;
  maintenance_mode: boolean;
}

export function GeneralSettings() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    id: "",
    site_name: "The Moral Hierarchy",
    admin_email: "admin@tmh.com",
    timezone: "utc",
    maintenance_mode: false
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        
        // Use raw querying since the table might not be in the TypeScript definitions
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching settings:", error);
          toast.error("Failed to load settings. Please try again.");
          return;
        }

        if (data) {
          // Explicitly map the fields to ensure type safety
          setSettings({
            id: data.id,
            site_name: data.site_name,
            admin_email: data.admin_email,
            timezone: data.timezone,
            maintenance_mode: data.maintenance_mode
          });
          
          console.log("Settings loaded:", data);
        }
      } catch (error) {
        console.error("Exception fetching settings:", error);
        toast.error("An unexpected error occurred while loading settings.");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.admin_email)) {
        toast.error("Please enter a valid email address");
        setSaving(false);
        return;
      }

      console.log("Saving settings:", settings);
      
      // Use raw query to update settings
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_name: settings.site_name,
          admin_email: settings.admin_email,
          timezone: settings.timezone,
          maintenance_mode: settings.maintenance_mode
        })
        .eq("id", settings.id);

      if (error) {
        console.error("Error saving settings:", error);
        toast.error("Failed to save settings: " + error.message);
        return;
      }

      toast.success("Settings saved successfully");
      console.log("Settings updated successfully");
    } catch (error: any) {
      console.error("Exception saving settings:", error);
      toast.error("An unexpected error occurred: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
          <Input 
            id="site-name" 
            value={settings.site_name} 
            onChange={(e) => setSettings({...settings, site_name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Admin Email</Label>
          <Input 
            id="admin-email" 
            type="email"
            value={settings.admin_email} 
            onChange={(e) => setSettings({...settings, admin_email: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select 
            value={settings.timezone}
            onValueChange={(value) => setSettings({...settings, timezone: value})}
          >
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
          <Switch 
            id="maintenance-mode" 
            checked={settings.maintenance_mode}
            onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked})}
          />
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


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [error, setError] = useState<string | null>(null);
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
        setError(null);
        
        // Use direct query instead of RPC
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1);

        if (error) {
          console.error("Error fetching settings:", error);
          setError(`Failed to load settings: ${error.message}`);
          toast.error("Failed to load settings: " + error.message);
          return;
        }

        if (data && data.length > 0) {
          const siteData = data[0];
          
          // Explicitly map the fields to ensure type safety
          setSettings({
            id: siteData.id,
            site_name: siteData.site_name,
            admin_email: siteData.admin_email,
            timezone: siteData.timezone,
            maintenance_mode: siteData.maintenance_mode
          });
          
          console.log("Settings loaded:", siteData);
        } else {
          console.warn("No settings found in database");
          toast.warning("Using default settings. Please save to create settings record.");
          
          // If no settings found, try to create a default record
          const { error: insertError } = await supabase
            .from('site_settings')
            .insert([{
              site_name: "The Moral Hierarchy",
              admin_email: "admin@tmh.com",
              timezone: "utc",
              maintenance_mode: false
            }]);
            
          if (insertError) {
            console.error("Error creating default settings:", insertError);
          }
        }
      } catch (error: any) {
        console.error("Exception fetching settings:", error);
        setError(`An unexpected error occurred: ${error.message}`);
        toast.error("An unexpected error occurred: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.admin_email)) {
        toast.error("Please enter a valid email address");
        setSaving(false);
        return;
      }

      console.log("Saving settings:", settings);
      
      // Use direct update query instead of RPC
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          site_name: settings.site_name,
          admin_email: settings.admin_email,
          timezone: settings.timezone,
          maintenance_mode: settings.maintenance_mode,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (updateError) {
        console.error("Error saving settings:", updateError);
        setError(`Failed to save settings: ${updateError.message}`);
        toast.error("Failed to save settings: " + updateError.message);
        return;
      }

      toast.success("Settings saved successfully");
      console.log("Settings updated successfully");
    } catch (error: any) {
      console.error("Exception saving settings:", error);
      setError(`An unexpected error occurred: ${error.message}`);
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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

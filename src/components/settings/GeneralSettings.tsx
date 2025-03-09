
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface SiteSettings {
  id: string;
  site_name: string;
  admin_email: string;
  timezone: string;
  maintenance_mode: boolean;
}

const passwordConfirmSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export function GeneralSettings() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [settings, setSettings] = useState<SiteSettings>({
    id: "",
    site_name: "The Moral Hierarchy",
    admin_email: "admin@tmh.com",
    timezone: "utc",
    maintenance_mode: false
  });

  const passwordForm = useForm<{ password: string }>({
    resolver: zodResolver(passwordConfirmSchema),
    defaultValues: { password: "" }
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        setError(null);
        
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
          
          setSettings({
            id: siteData.id,
            site_name: siteData.site_name,
            admin_email: siteData.admin_email,
            timezone: siteData.timezone,
            maintenance_mode: siteData.maintenance_mode
          });
          
          setOriginalEmail(siteData.admin_email);
          
          console.log("Settings loaded:", siteData);
        } else {
          console.warn("No settings found in database");
          toast.warning("Using default settings. Please save to create settings record.");
          
          // Create default settings record if none exists
          const { data: insertData, error: insertError } = await supabase
            .from('site_settings')
            .insert([{
              site_name: "The Moral Hierarchy",
              admin_email: "admin@tmh.com",
              timezone: "utc",
              maintenance_mode: false
            }])
            .select();
            
          if (insertError) {
            console.error("Error creating default settings:", insertError);
            setError(`Failed to create default settings: ${insertError.message}`);
          } else if (insertData && insertData.length > 0) {
            // Set the ID from the newly created record
            setSettings({
              ...settings,
              id: insertData[0].id
            });
            console.log("Created default settings:", insertData[0]);
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
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.admin_email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // If email is changed, require password confirmation
      if (settings.admin_email !== originalEmail) {
        setShowPasswordConfirm(true);
        return;
      }

      await saveSettings();
    } catch (error: any) {
      console.error("Exception preparing save:", error);
      setError(`An unexpected error occurred: ${error.message}`);
      toast.error("An unexpected error occurred: " + error.message);
    }
  };

  const saveSettings = async (password?: string) => {
    try {
      setSaving(true);
      setError(null);
      
      console.log("Saving settings:", settings);
      
      // If email is changed and password is provided, verify the password
      if (password && settings.admin_email !== originalEmail) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("You must be logged in to change admin email");
          toast.error("Authentication required to change admin email");
          return;
        }
        
        // Verify password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: password
        });
        
        if (signInError) {
          console.error("Password verification failed:", signInError);
          setError("Incorrect password. Admin email was not updated.");
          toast.error("Password verification failed");
          return;
        }
      }
      
      // Update settings in database
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          site_name: settings.site_name,
          admin_email: settings.admin_email,
          timezone: settings.timezone,
          maintenance_mode: settings.maintenance_mode
        })
        .eq('id', settings.id);

      if (updateError) {
        console.error("Error saving settings:", updateError);
        setError(`Failed to save settings: ${updateError.message}`);
        toast.error("Failed to save settings: " + updateError.message);
        return;
      }

      // Update originalEmail if admin_email changed
      if (settings.admin_email !== originalEmail) {
        setOriginalEmail(settings.admin_email);
      }

      toast.success("Settings saved successfully");
      console.log("Settings updated successfully");
      
      // Close password confirmation dialog and reset form
      setShowPasswordConfirm(false);
      passwordForm.reset();
      
    } catch (error: any) {
      console.error("Exception saving settings:", error);
      setError(`An unexpected error occurred: ${error.message}`);
      toast.error("An unexpected error occurred: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordConfirm = async (data: { password: string }) => {
    await saveSettings(data.password);
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
    <>
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
            {settings.admin_email !== originalEmail && (
              <p className="text-sm text-amber-500 mt-1">
                Changing admin email will require password confirmation for security.
              </p>
            )}
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

      <Dialog open={showPasswordConfirm} onOpenChange={setShowPasswordConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Password</DialogTitle>
            <DialogDescription>
              For security, please enter your password to confirm admin email changes.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordConfirm)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordConfirm(false);
                    setSettings(prev => ({...prev, admin_email: originalEmail}));
                    passwordForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Verifying..." : "Confirm"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

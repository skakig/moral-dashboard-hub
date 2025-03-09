
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveUserDemographics, getUserDemographics, detectAndSaveDeviceType } from "@/services/demographicsService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function DemographicForm() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    age_range: "",
    gender: "",
    country: "",
    region: "",
    primary_language: "",
    timezone: "",
  });

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Auto-detect device type
        detectAndSaveDeviceType(user.id);
        
        // Load existing demographics if any
        try {
          const data = await getUserDemographics(user.id);
          if (data) {
            setFormData({
              age_range: data.age_range || "",
              gender: data.gender || "",
              country: data.country || "",
              region: data.region || "",
              primary_language: data.primary_language || "",
              timezone: data.timezone || "",
            });
          }
        } catch (error) {
          console.error("Error loading demographics:", error);
        }
      }
      
      setLoading(false);
    };

    getCurrentUser();
    
    // Set timezone automatically
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setFormData(prev => ({ ...prev, timezone: tz }));
    } catch (e) {
      console.log("Timezone detection not supported");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    if (!formData.age_range || !formData.gender) {
      toast.error("Age range and gender are required");
      return;
    }
    
    setSaving(true);
    
    try {
      await saveUserDemographics({
        user_id: user.id,
        ...formData,
        device_type: detectAndSaveDeviceType(user.id)
      });
      
      toast.success("Demographics saved successfully");
    } catch (error: any) {
      toast.error("Failed to save demographics: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to update your profile.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          Help us personalize your experience by sharing some information about yourself
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="age_range">Age Range</Label>
            <Select
              value={formData.age_range}
              onValueChange={(value) => setFormData({ ...formData, age_range: value })}
            >
              <SelectTrigger id="age_range">
                <SelectValue placeholder="Select your age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Under 18">Under 18</SelectItem>
                <SelectItem value="18-21">18-21</SelectItem>
                <SelectItem value="22-25">22-25</SelectItem>
                <SelectItem value="26-30">26-30</SelectItem>
                <SelectItem value="31-35">31-35</SelectItem>
                <SelectItem value="36-40">36-40</SelectItem>
                <SelectItem value="41-45">41-45</SelectItem>
                <SelectItem value="46-50">46-50</SelectItem>
                <SelectItem value="51-55">51-55</SelectItem>
                <SelectItem value="56-60">56-60</SelectItem>
                <SelectItem value="61-65">61-65</SelectItem>
                <SelectItem value="66-70">66-70</SelectItem>
                <SelectItem value="71+">71+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Enter your country"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="region">Region/State</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              placeholder="Enter your region or state"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="primary_language">Primary Language</Label>
            <Input
              id="primary_language"
              value={formData.primary_language}
              onChange={(e) => setFormData({ ...formData, primary_language: e.target.value })}
              placeholder="Enter your primary language"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              placeholder="Enter your timezone"
              disabled
            />
            <p className="text-xs text-muted-foreground">Automatically detected from your browser</p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

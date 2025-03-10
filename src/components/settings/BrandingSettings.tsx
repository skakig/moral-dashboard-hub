
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface BrandingSettings {
  id: string;
  youtube_channel: string;
  instagram_handle: string;
  tiktok_handle: string;
  twitter_handle: string;
  facebook_page: string;
  website_url: string;
  company_name: string;
  tagline: string;
  created_at?: string;
  updated_at?: string;
}

export function BrandingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BrandingSettings>({
    defaultValues: {
      youtube_channel: "",
      instagram_handle: "",
      tiktok_handle: "",
      twitter_handle: "",
      facebook_page: "",
      website_url: "",
      company_name: "",
      tagline: ""
    }
  });

  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  const fetchBrandingSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch branding settings from the database
      const { data, error } = await supabase
        .from('branding_settings')
        .select('*')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Populate form with existing data
        reset(data[0]);
      } else {
        // Create default settings if none exist
        const { data: insertData, error: insertError } = await supabase
          .from('branding_settings')
          .insert([{
            youtube_channel: "",
            instagram_handle: "",
            tiktok_handle: "",
            twitter_handle: "",
            facebook_page: "",
            website_url: "",
            company_name: "The Moral Hierarchy",
            tagline: "Elevate Your Moral Understanding"
          }])
          .select();
          
        if (insertError) {
          throw insertError;
        }
        
        if (insertData && insertData.length > 0) {
          reset(insertData[0]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching branding settings:", error);
      setError(`Failed to load branding settings: ${error.message}`);
      toast.error("Failed to load branding settings");
    } finally {
      setLoading(false);
    }
  };

  const saveBrandingSettings = async (data: BrandingSettings) => {
    try {
      setSaving(true);
      setError(null);
      
      const { error } = await supabase
        .from('branding_settings')
        .update({
          youtube_channel: data.youtube_channel,
          instagram_handle: data.instagram_handle,
          tiktok_handle: data.tiktok_handle,
          twitter_handle: data.twitter_handle,
          facebook_page: data.facebook_page,
          website_url: data.website_url,
          company_name: data.company_name,
          tagline: data.tagline,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      if (error) {
        throw error;
      }
      
      toast.success("Branding settings saved successfully");
    } catch (error: any) {
      console.error("Error saving branding settings:", error);
      setError(`Failed to save branding settings: ${error.message}`);
      toast.error("Failed to save branding settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branding Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Settings</CardTitle>
        <CardDescription>
          Configure brand variables used in content generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(saveBrandingSettings)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company/Brand Name</Label>
            <Input 
              id="company_name" 
              {...register("company_name", { required: "Brand name is required" })}
            />
            {errors.company_name && (
              <p className="text-sm text-red-500">{errors.company_name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline/Slogan</Label>
            <Input 
              id="tagline" 
              {...register("tagline")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input 
              id="website_url" 
              type="url"
              placeholder="https://example.com"
              {...register("website_url")}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="youtube_channel">YouTube Channel</Label>
              <Input 
                id="youtube_channel" 
                placeholder="@yourchannel"
                {...register("youtube_channel")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram Handle</Label>
              <Input 
                id="instagram_handle" 
                placeholder="@yourusername"
                {...register("instagram_handle")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tiktok_handle">TikTok Handle</Label>
              <Input 
                id="tiktok_handle" 
                placeholder="@yourusername"
                {...register("tiktok_handle")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter_handle">Twitter/X Handle</Label>
              <Input 
                id="twitter_handle" 
                placeholder="@yourusername"
                {...register("twitter_handle")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facebook_page">Facebook Page</Label>
              <Input 
                id="facebook_page" 
                placeholder="yourbusiness"
                {...register("facebook_page")}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Branding Settings"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

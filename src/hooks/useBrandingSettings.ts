
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BrandingSettings } from "@/types/settings";
import { supabase } from "@/integrations/supabase/client";

export function useBrandingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<BrandingSettings | null>(null);

  const fetchBrandingSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('branding_settings')
        .select('*')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setSettings(data[0]);
      } else {
        const defaultSettings = {
          company_name: "The Moral Hierarchy",
          tagline: "Elevate Your Moral Understanding",
          youtube_channel: "",
          instagram_handle: "",
          tiktok_handle: "",
          twitter_handle: "",
          facebook_page: "",
          website_url: ""
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('branding_settings')
          .insert([defaultSettings])
          .select();
          
        if (insertError) {
          throw insertError;
        }
        
        if (insertData && insertData.length > 0) {
          setSettings(insertData[0]);
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

  const saveBrandingSettings = async (updatedSettings: BrandingSettings) => {
    try {
      setSaving(true);
      setError(null);
      
      const { error } = await supabase
        .from('branding_settings')
        .update(updatedSettings)
        .eq('id', updatedSettings.id);
      
      if (error) {
        throw error;
      }
      
      setSettings(updatedSettings);
      toast.success("Branding settings saved successfully");
    } catch (error: any) {
      console.error("Error saving branding settings:", error);
      setError(`Failed to save branding settings: ${error.message}`);
      toast.error("Failed to save branding settings");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    error,
    fetchBrandingSettings,
    saveBrandingSettings
  };
}

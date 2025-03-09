
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteSettings, PasswordConfirmData } from "@/types/settings";
import { 
  fetchSiteSettings, 
  createDefaultSettings, 
  updateSiteSettings,
  verifyUserPassword,
  getCurrentUser 
} from "@/services/siteSettingsService";
import { isValidEmail } from "@/utils/validationUtils";

export function useGeneralSettings() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    id: "",
    site_name: "The Moral Hierarchy",
    admin_email: "admin@tmh.com",
    timezone: "utc",
    maintenance_mode: false
  });

  const initializeSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching settings...");
      
      const data = await fetchSiteSettings();
      
      console.log("Settings data received:", data);
      
      if (data && data.length > 0) {
        const siteData = data[0];
        
        setSettings({
          id: siteData.id,
          site_name: siteData.site_name,
          admin_email: siteData.admin_email,
          timezone: siteData.timezone || "utc",
          maintenance_mode: siteData.maintenance_mode
        });
        
        setSettingsId(siteData.id);
        setOriginalEmail(siteData.admin_email);
        
        console.log("Settings loaded:", siteData);
      } else {
        console.warn("No settings found in database");
        toast.warning("Using default settings. Please save to create settings record.");
        
        // Create default settings record if none exists
        const insertData = await createDefaultSettings();
          
        if (insertData && insertData.length > 0) {
          // Set the ID from the newly created record
          const newId = insertData[0].id;
          setSettingsId(newId);
          setSettings({
            ...settings,
            id: newId
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
  };

  const handleSave = async () => {
    try {
      // Validate email
      if (!isValidEmail(settings.admin_email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // If email is changed, require password confirmation
      if (settings.admin_email !== originalEmail) {
        setShowPasswordConfirm(true);
        return;
      }

      await saveSettings({});
    } catch (error: any) {
      console.error("Exception preparing save:", error);
      setError(`An unexpected error occurred: ${error.message}`);
      toast.error("An unexpected error occurred: " + error.message);
    }
  };

  const saveSettings = async (data: PasswordConfirmData) => {
    try {
      setSaving(true);
      setError(null);
      
      console.log("Saving settings with values:", settings);
      
      if (!settingsId) {
        setError("Settings ID is missing. Please refresh the page.");
        toast.error("Settings ID is missing. Please refresh the page.");
        return;
      }
      
      // If email is changed and password is provided, verify the password
      if (data.password && settings.admin_email !== originalEmail) {
        const user = await getCurrentUser();
        
        if (!user) {
          setError("You must be logged in to change admin email");
          toast.error("Authentication required to change admin email");
          return;
        }
        
        // Verify password by attempting to sign in
        try {
          await verifyUserPassword(user.email!, data.password);
        } catch (error: any) {
          console.error("Password verification failed:", error);
          setError("Incorrect password. Admin email was not updated.");
          toast.error("Password verification failed");
          return;
        }
      }
      
      // Update the settings
      await updateSiteSettings(settings);

      // Update originalEmail if admin_email changed
      if (settings.admin_email !== originalEmail) {
        setOriginalEmail(settings.admin_email);
      }

      toast.success("Settings saved successfully");
      console.log("Settings updated successfully");
      
      // Refresh settings to ensure UI is updated with the latest data
      await initializeSettings();
      
      // Close password confirmation dialog
      setShowPasswordConfirm(false);
      
    } catch (error: any) {
      console.error("Exception saving settings:", error);
      setError(`An unexpected error occurred: ${error.message}`);
      toast.error("An unexpected error occurred: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    initializeSettings();
  }, []);

  return {
    settings,
    setSettings,
    loading,
    saving,
    error,
    originalEmail,
    showPasswordConfirm,
    setShowPasswordConfirm,
    handleSave,
    saveSettings
  };
}

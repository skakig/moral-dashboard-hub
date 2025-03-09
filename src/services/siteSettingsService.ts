
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings } from "@/types/settings";

/**
 * Fetches site settings from the database
 */
export async function fetchSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1);

  if (error) {
    throw new Error(`Failed to load settings: ${error.message}`);
  }

  return data;
}

/**
 * Creates default settings if none exist
 */
export async function createDefaultSettings() {
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
    throw new Error(`Failed to create default settings: ${insertError.message}`);
  }

  return insertData;
}

/**
 * Updates site settings via the Edge Function
 */
export async function updateSiteSettings(settings: SiteSettings) {
  try {
    // Try using the Edge Function first
    const { error: edgeFunctionError } = await supabase.functions.invoke('update-site-settings', {
      body: {
        id: settings.id,
        site_name: settings.site_name,
        admin_email: settings.admin_email,
        timezone: settings.timezone,
        maintenance_mode: settings.maintenance_mode
      }
    });

    if (edgeFunctionError) {
      // Fallback to direct update if edge function fails
      const { error: directUpdateError } = await supabase
        .from('site_settings')
        .update({
          site_name: settings.site_name,
          admin_email: settings.admin_email,
          timezone: settings.timezone,
          maintenance_mode: settings.maintenance_mode,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (directUpdateError) {
        throw new Error(`Failed to save settings: ${directUpdateError.message}`);
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Verifies user password for admin email changes
 */
export async function verifyUserPassword(userEmail: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password
  });
  
  if (error) {
    throw new Error("Incorrect password. Admin email was not updated.");
  }

  return true;
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

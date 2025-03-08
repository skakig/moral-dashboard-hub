
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Checks if an API key already exists for a specific service
 * @param supabase Supabase client
 * @param serviceName Service name to check
 * @returns The existing key data or null, and any error
 */
export async function getExistingApiKey(
  supabase: SupabaseClient, 
  serviceName: string
): Promise<{data: any, error: any}> {
  console.log(`Checking for existing API key for ${serviceName}`);
  
  try {
    const result = await supabase
      .from("api_keys")
      .select("id, api_key, is_primary")
      .eq("service_name", serviceName);
    
    return result;
  } catch (error) {
    console.error("Error querying existing key:", error);
    return { data: null, error };
  }
}

/**
 * Resets the primary flag for all keys in a category
 * @param supabase Supabase client
 * @param category Category to reset
 * @returns Operation result
 */
export async function resetPrimaryKeysInCategory(
  supabase: SupabaseClient, 
  category: string
): Promise<{error: any}> {
  console.log(`Resetting primary status for other keys in category: ${category}`);
  
  try {
    const result = await supabase
      .from("api_keys")
      .update({ is_primary: false })
      .eq("category", category);
    
    return { error: result.error };
  } catch (error) {
    console.warn("Error resetting primary status for other keys:", error);
    return { error };
  }
}

/**
 * Updates an existing API key record
 * @param supabase Supabase client
 * @param id Key ID to update
 * @param data Updated key data
 * @returns Operation result
 */
export async function updateApiKey(
  supabase: SupabaseClient, 
  id: string, 
  data: {
    apiKey: string,
    category: string,
    baseUrl: string,
    isPrimary: boolean
  }
): Promise<{error: any}> {
  console.log(`Updating existing API key ID: ${id}`);
  
  try {
    const result = await supabase
      .from("api_keys")
      .update({ 
        api_key: data.apiKey,
        category: data.category,
        base_url: data.baseUrl || '',
        is_primary: data.isPrimary,
        last_validated: new Date().toISOString(),
        status: 'active',
        is_active: true
      })
      .eq("id", id);
    
    return { error: result.error };
  } catch (error) {
    console.error("Error updating API key:", error);
    return { error };
  }
}

/**
 * Inserts a new API key record
 * @param supabase Supabase client
 * @param data New key data
 * @returns Operation result
 */
export async function insertApiKey(
  supabase: SupabaseClient, 
  data: {
    serviceName: string,
    category: string,
    apiKey: string,
    baseUrl: string,
    isPrimary: boolean
  }
): Promise<{error: any}> {
  console.log(`Inserting new API key for service: ${data.serviceName}`);
  
  try {
    const result = await supabase
      .from("api_keys")
      .insert({ 
        service_name: data.serviceName,
        category: data.category,
        api_key: data.apiKey,
        base_url: data.baseUrl || '',
        is_primary: data.isPrimary,
        last_validated: new Date().toISOString(),
        status: 'active',
        is_active: true
      });
    
    return { error: result.error };
  } catch (error) {
    console.error("Error inserting API key:", error);
    return { error };
  }
}

/**
 * Fetches the updated API key record
 * @param supabase Supabase client
 * @param serviceName Service name to fetch
 * @returns The fetched key or null, and any error
 */
export async function fetchUpdatedApiKey(
  supabase: SupabaseClient, 
  serviceName: string
): Promise<{data: any, error: any}> {
  console.log(`Fetching updated API key for ${serviceName}`);
  
  try {
    const result = await supabase
      .from("api_keys")
      .select("*")
      .eq("service_name", serviceName);
    
    return result;
  } catch (error) {
    console.error("Error fetching updated key:", error);
    return { data: null, error };
  }
}

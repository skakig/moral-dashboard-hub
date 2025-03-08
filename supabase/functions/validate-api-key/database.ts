
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Data structure for API key information
 */
interface ApiKeyData {
  serviceName: string;
  category: string;
  apiKey: string;
  baseUrl?: string;
  isPrimary?: boolean;
}

/**
 * Database operation result
 */
interface DbOperationResult {
  success?: boolean;
  data?: any;
  error?: any;
  warning?: string;
}

/**
 * Checks if an API key already exists for a specific service
 * @param supabase Supabase client
 * @param serviceName Service name to check
 * @returns The existing key data or null, and any error
 */
async function getExistingApiKey(supabase: SupabaseClient, serviceName: string): Promise<{data: any, error: any}> {
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
async function resetPrimaryKeysInCategory(supabase: SupabaseClient, category: string): Promise<{error: any}> {
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
async function updateApiKey(
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
async function insertApiKey(
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
async function fetchUpdatedApiKey(supabase: SupabaseClient, serviceName: string): Promise<{data: any, error: any}> {
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

/**
 * Updates or inserts an API key in the database
 * @param supabase Supabase client instance
 * @param data API key data to save
 * @returns Operation result with success status and data or error
 */
export async function updateOrInsertApiKey(supabase: SupabaseClient, data: ApiKeyData): Promise<DbOperationResult> {
  const { serviceName, category, apiKey, baseUrl, isPrimary = false } = data;

  try {
    console.log(`Attempting to update/insert API key for ${serviceName} in category ${category}`);
    console.log(`Using base URL: ${baseUrl || 'None provided'}`);
    
    // Check if the service exists first to handle the unique constraint
    const { data: existingKeys, error: queryError } = await getExistingApiKey(supabase, serviceName);
    
    if (queryError) {
      console.error("Error querying existing key:", queryError);
      return { error: queryError };
    }
    
    let result;
    
    // If this key is being set as primary, reset other keys in the same category
    if (isPrimary) {
      console.log(`Setting ${serviceName} as primary key for ${category}. Resetting other keys...`);
      const { error: resetError } = await resetPrimaryKeysInCategory(supabase, category);
      
      if (resetError) {
        console.warn("Error resetting primary status for other keys:", resetError);
        // Continue anyway
      }
    }
    
    if (existingKeys && existingKeys.length > 0) {
      const existingKey = existingKeys[0];
      console.log(`Found existing key for ${serviceName}, updating...`);
      
      // Update existing record
      result = await updateApiKey(supabase, existingKey.id, {
        apiKey,
        category,
        baseUrl: baseUrl || '',
        isPrimary
      });
    } else {
      console.log(`No existing key for ${serviceName}, inserting new...`);
      // Insert new record
      result = await insertApiKey(supabase, {
        serviceName,
        category,
        apiKey,
        baseUrl: baseUrl || '',
        isPrimary
      });
    }
    
    if (result.error) {
      console.error("Error updating/inserting API key:", result.error);
      return { error: result.error };
    }
    
    // Fetch and return the updated record
    const { data: updatedKeys, error: fetchError } = await fetchUpdatedApiKey(supabase, serviceName);
      
    if (fetchError) {
      console.error("Error fetching updated key:", fetchError);
      return { 
        success: true, 
        data: result.data, 
        warning: "Successfully saved but couldn't fetch updated record" 
      };
    }
    
    if (!updatedKeys || updatedKeys.length === 0) {
      console.error("No records found after update/insert");
      return { 
        success: true, 
        data: null, 
        warning: "Successfully saved but couldn't find the record afterward" 
      };
    }
    
    console.log(`Successfully updated/inserted API key for ${serviceName}`);
    return { success: true, data: updatedKeys[0] };
  } catch (error) {
    console.error("Exception in database operation:", error);
    return { error };
  }
}

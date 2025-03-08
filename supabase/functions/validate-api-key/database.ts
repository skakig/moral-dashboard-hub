
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { ApiKeyData, DbOperationResult } from "./types.ts";
import { 
  getExistingApiKey, 
  resetPrimaryKeysInCategory, 
  updateApiKey, 
  insertApiKey, 
  fetchUpdatedApiKey 
} from "./queries.ts";

/**
 * Updates or inserts an API key in the database
 * @param supabase Supabase client instance
 * @param data API key data to save
 * @returns Operation result with success status and data or error
 */
export async function updateOrInsertApiKey(
  supabase: SupabaseClient, 
  data: ApiKeyData
): Promise<DbOperationResult> {
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

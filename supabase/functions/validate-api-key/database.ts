
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

interface ApiKeyData {
  serviceName: string;
  category: string;
  apiKey: string;
  baseUrl?: string;
}

export async function updateOrInsertApiKey(supabase: SupabaseClient, data: ApiKeyData) {
  const { serviceName, category, apiKey, baseUrl } = data;

  try {
    console.log(`Attempting to update/insert API key for ${serviceName} in category ${category}`);
    console.log(`Using base URL: ${baseUrl || 'None provided'}`);
    
    // Check if the service exists first to handle the unique constraint
    const { data: existingKey, error: queryError } = await supabase
      .from("api_keys")
      .select("id, api_key")
      .eq("service_name", serviceName)
      .maybeSingle();
    
    if (queryError) {
      console.error("Error querying existing key:", queryError);
      return { error: queryError };
    }
    
    let result;
    if (existingKey) {
      console.log(`Found existing key for ${serviceName}, updating...`);
      // Update existing record
      result = await supabase
        .from("api_keys")
        .update({ 
          api_key: apiKey,
          category: category,
          base_url: baseUrl || '',
          last_validated: new Date().toISOString(),
          status: 'active',
          is_active: true
        })
        .eq("id", existingKey.id)
        .select();
    } else {
      console.log(`No existing key for ${serviceName}, inserting new...`);
      // Insert new record
      result = await supabase
        .from("api_keys")
        .insert({ 
          service_name: serviceName,
          category: category,
          api_key: apiKey,
          base_url: baseUrl || '',
          last_validated: new Date().toISOString(),
          status: 'active',
          is_active: true
        })
        .select();
    }
    
    if (result.error) {
      console.error("Error updating/inserting API key:", result.error);
      return { error: result.error };
    }
    
    console.log(`Successfully updated/inserted API key for ${serviceName}`);
    console.log("Database operation result:", result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Exception in database operation:", error);
    return { error };
  }
}

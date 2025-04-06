
/**
 * Updates or inserts an API key in the database
 * @param supabaseClient The initialized Supabase client
 * @param params API key data to update or insert
 * @returns Result object with success status, data and optional error
 */
export async function updateOrInsertApiKey(supabaseClient, params) {
  try {
    const { serviceName, category, apiKey, baseUrl, isPrimary } = params;
    
    console.log(`Checking if API key for ${serviceName} exists`);
    
    // Check if there's an existing key for this service
    const { data: existingKeys, error: fetchError } = await supabaseClient
      .from("api_keys")
      .select("id, service_name")
      .eq("service_name", serviceName)
      .limit(1);
    
    if (fetchError) {
      console.error("Error fetching existing keys:", fetchError);
      return { success: false, error: fetchError };
    }
    
    const now = new Date().toISOString();
    
    // If primary is specified, reset other keys in the same category first
    if (isPrimary) {
      console.log(`Setting this key as primary for category: ${category}`);
      
      const { error: resetError } = await supabaseClient
        .from("api_keys")
        .update({ is_primary: false, updated_at: now })
        .eq("category", category);
      
      if (resetError) {
        console.warn("Error resetting other keys' primary status:", resetError);
        // Continue anyway
      }
    }
    
    // Prepare the record for insertion/update
    const record = {
      service_name: serviceName,
      category: category,
      api_key: apiKey,
      base_url: baseUrl || "",
      is_primary: isPrimary === true,
      created_at: now,
      updated_at: now,
      last_validated: now,
      validation_errors: null
    };
    
    let result;
    
    // Update or insert based on whether the key exists
    if (existingKeys && existingKeys.length > 0) {
      console.log(`Updating existing API key for ${serviceName}`);
      
      const { data, error } = await supabaseClient
        .from("api_keys")
        .update({
          ...record,
          updated_at: now
        })
        .eq("id", existingKeys[0].id)
        .select();
      
      result = { success: !error, data, error };
    } else {
      console.log(`Creating new API key for ${serviceName}`);
      
      const { data, error } = await supabaseClient
        .from("api_keys")
        .insert(record)
        .select();
      
      result = { success: !error, data, error };
    }
    
    return result;
  } catch (error) {
    console.error("Error in updateOrInsertApiKey:", error);
    return { success: false, error };
  }
}

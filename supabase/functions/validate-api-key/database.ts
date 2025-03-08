
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

interface ApiKeyData {
  serviceName: string;
  category: string;
  apiKey: string;
  baseUrl?: string;
}

export async function updateOrInsertApiKey(supabase: SupabaseClient, data: ApiKeyData) {
  const { serviceName, category, apiKey, baseUrl } = data;

  // Check if the service exists first to handle the unique constraint
  const { data: existingKey } = await supabase
    .from("api_keys")
    .select("id")
    .eq("service_name", serviceName)
    .eq("category", category)
    .single();
  
  let result;
  if (existingKey) {
    // Update existing record
    result = await supabase
      .from("api_keys")
      .update({ 
        api_key: apiKey,
        base_url: baseUrl || '',
        last_validated: new Date().toISOString(),
        status: 'active'
      })
      .eq("id", existingKey.id);
  } else {
    // Insert new record
    result = await supabase
      .from("api_keys")
      .insert({ 
        service_name: serviceName,
        category: category,
        api_key: apiKey,
        base_url: baseUrl || '',
        last_validated: new Date().toISOString(),
        status: 'active'
      });
  }
  
  return result;
}

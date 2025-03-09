
// Fetch API keys from database
export async function fetchApiKeys(supabase) {
  console.log("Fetching API keys from database...");
  try {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("service_name");
      
    if (error) {
      console.error("Error fetching API keys:", error);
      throw new Error(`Failed to fetch API keys: ${error.message}`);
    }
    
    console.log(`Retrieved ${data?.length || 0} API keys with these IDs:`, 
      data?.map(key => `${key.id} (${key.service_name})`).join(', ') || 'none');
    
    if (!data || data.length === 0) {
      console.log("No API keys found in the database");
    }
    
    return data || [];
  } catch (err) {
    console.error("Exception in fetchApiKeys:", err);
    return [];
  }
}

// Format API keys for frontend consumption
export function formatApiKeys(apiKeys) {
  console.log(`Formatting ${apiKeys?.length || 0} API keys for frontend`);
  
  // Organize API keys by category
  const apiKeysByCategory = {};
  
  if (apiKeys && apiKeys.length > 0) {
    apiKeys.forEach(key => {
      const category = key.category || "Uncategorized";
      if (!apiKeysByCategory[category]) {
        apiKeysByCategory[category] = [];
      }
      
      apiKeysByCategory[category].push({
        id: key.id,
        serviceName: key.service_name,
        baseUrl: key.base_url || '',
        isConfigured: true,
        isActive: key.is_active || false,
        isPrimary: key.is_primary || false,
        lastValidated: key.last_validated,
        createdAt: key.created_at,
        category: key.category,
        validationErrors: key.validation_errors || []
      });
    });
  }
  
  console.log("Formatted API keys by category:", Object.keys(apiKeysByCategory));
  for (const category in apiKeysByCategory) {
    const services = apiKeysByCategory[category].map(k => k.serviceName).join(', ');
    console.log(`- ${category}: ${apiKeysByCategory[category].length} keys (${services})`);
  }
  
  return apiKeysByCategory;
}

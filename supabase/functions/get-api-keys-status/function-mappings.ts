
// Fetch function mappings from database
export async function fetchFunctionMappings(supabase) {
  const { data, error } = await supabase
    .from("api_function_mapping")
    .select("*")
    .order("function_name");
    
  if (error) {
    console.log("Error fetching function mappings:", error);
    return [];
  }
  
  console.log(`Retrieved ${data?.length || 0} function mappings`);
  return data || [];
}

// Format function mappings for frontend
export function formatFunctionMappings(mappings) {
  return mappings.map(mapping => ({
    id: mapping.id,
    function_name: mapping.function_name,
    preferred_service: mapping.preferred_service,
    fallback_service: mapping.fallback_service,
    description: mapping.description,
    updated_at: mapping.updated_at
  }));
}

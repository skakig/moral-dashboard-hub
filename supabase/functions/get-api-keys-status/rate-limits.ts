
// Fetch API rate limits
export async function fetchRateLimits(supabase) {
  const { data, error } = await supabase
    .from("api_rate_limits")
    .select("*")
    .order("service_name");

  if (error) {
    console.log("Error fetching rate limits:", error);
    return [];
  }
  
  console.log(`Retrieved ${data?.length || 0} rate limits`);
  return data || [];
}

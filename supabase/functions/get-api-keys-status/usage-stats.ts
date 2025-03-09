
// Fetch API usage stats
export async function fetchUsageStats(supabase) {
  const { data, error } = await supabase
    .from("api_usage_logs")
    .select("service_name, success, response_time_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
      
  if (error) {
    console.log("Error fetching usage stats:", error);
    return [];
  }
  
  return data || [];
}

// Process usage statistics by service
function processStatsByService(usageData, usageStats) {
  usageData.forEach(log => {
    const service = log.service_name;
    if (!usageStats.byService[service]) {
      usageStats.byService[service] = {
        total: 0,
        success: 0,
        failed: 0,
        avgResponseTime: 0
      };
    }
    
    usageStats.byService[service].total++;
    if (log.success) {
      usageStats.byService[service].success++;
    } else {
      usageStats.byService[service].failed++;
    }
    
    // Update average response time
    const currentTotal = usageStats.byService[service].avgResponseTime * (usageStats.byService[service].total - 1);
    const newAvg = (currentTotal + (log.response_time_ms || 0)) / usageStats.byService[service].total;
    usageStats.byService[service].avgResponseTime = newAvg;
  });
}

// Process usage statistics by category
function processStatsByCategory(usageStats, apiKeys) {
  // Create service to category mapping
  const serviceToCategory = {};
  apiKeys.forEach(key => {
    serviceToCategory[key.service_name] = key.category;
  });
  
  // Group by category
  Object.keys(usageStats.byService).forEach(service => {
    const category = serviceToCategory[service] || 'Uncategorized';
    if (!usageStats.byCategory[category]) {
      usageStats.byCategory[category] = {
        total: 0,
        success: 0,
        failed: 0,
        services: {}
      };
    }
    
    usageStats.byCategory[category].total += usageStats.byService[service].total;
    usageStats.byCategory[category].success += usageStats.byService[service].success;
    usageStats.byCategory[category].failed += usageStats.byService[service].failed;
    usageStats.byCategory[category].services[service] = usageStats.byService[service];
  });
}

// Process and organize usage stats
export function processUsageStats(usageData, apiKeys) {
  const usageStats = {
    byService: {},
    byCategory: {},
    recentCalls: usageData || []
  };
  
  if (usageData && usageData.length > 0) {
    // Process stats by service
    processStatsByService(usageData, usageStats);
    
    // Process stats by category
    if (apiKeys && apiKeys.length > 0) {
      processStatsByCategory(usageStats, apiKeys);
    }
  }
  
  return usageStats;
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define proper types for API data
interface APIKey {
  id: string;
  serviceName: string;
  isConfigured: boolean;
  isActive: boolean;
  isPrimary: boolean;
  baseUrl?: string;
  category: string;
  lastValidated?: string;
  created_at: string;
  updated_at: string;
}

interface FunctionMapping {
  function_name: string;
  category: string;
  description?: string;
  preferred_service?: string;
}

// Update RateLimit interface to match the expected schema
interface RateLimit {
  id: string;
  service_name: string;
  requests_used: number;
  request_limit: number;
  reset_date: string;
}

interface UsageStats {
  byService: Record<string, number>;
  byCategory: Record<string, number>;
}

interface APIData {
  apiKeysByCategory: Record<string, APIKey[]>;
  functionMappings: FunctionMapping[];
  rateLimits: RateLimit[];
  usageStats: UsageStats;
}

export function useAPIData() {
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<APIData>({
    apiKeysByCategory: {},
    functionMappings: [],
    rateLimits: [],
    usageStats: { byService: {}, byCategory: {} }
  });

  // Function to fetch API data from Supabase function
  const fetchApiData = async () => {
    setApiKeysLoading(true);
    setLoadError(null);
    
    try {
      console.log("Calling get-api-keys-status edge function...");
      // Call the Supabase edge function to get API key status
      const { data, error } = await supabase.functions.invoke('get-api-keys-status');
      
      if (error) {
        console.error('Error fetching API keys:', error);
        setLoadError(`Failed to load API keys: ${error.message}`);
        return;
      }
      
      if (!data) {
        setLoadError('No API data returned from server');
        return;
      }
      
      console.log('API data received:', data);
      
      // Check if data has the expected structure
      if (!data.apiKeysByCategory && data.success) {
        // Handle the case where data is nested under a success property
        console.log('Data is nested under success property, extracting...');
        setApiData({
          apiKeysByCategory: data.apiKeysByCategory || {},
          functionMappings: data.functionMappings || [],
          rateLimits: data.rateLimits || [],
          usageStats: data.usageStats || { byService: {}, byCategory: {} }
        });
      } else {
        // Use data directly
        setApiData({
          apiKeysByCategory: data.apiKeysByCategory || {},
          functionMappings: data.functionMappings || [],
          rateLimits: data.rateLimits || [],
          usageStats: data.usageStats || { byService: {}, byCategory: {} }
        });
      }

      console.log("Data processed successfully:", 
        Object.keys(data.apiKeysByCategory || {}).length, "categories");
    } catch (err: any) {
      console.error('Exception fetching API data:', err);
      setLoadError(`Error loading API keys: ${err.message}`);
    } finally {
      setApiKeysLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchApiData();
  }, []);
  
  // Check if any category has more than 0 keys
  const hasKeys = Object.values(apiData.apiKeysByCategory).some(
    (keys) => keys && keys.length > 0
  );

  return {
    apiKeysLoading,
    loadError,
    apiData,
    hasKeys,
    reloadApiData: fetchApiData
  };
}

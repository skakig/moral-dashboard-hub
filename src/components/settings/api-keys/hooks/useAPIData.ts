
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

interface RateLimit {
  id: string;
  service_name: string;
  limit_type: string;
  max_requests: number;
  time_window: number;
  current_usage: number;
  reset_at: string;
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

  const fetchApiData = async () => {
    setApiKeysLoading(true);
    setLoadError(null);
    
    try {
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
      
      // Group API keys by category
      const apiKeysByCategory: Record<string, APIKey[]> = {};
      
      if (data.apiKeys && Array.isArray(data.apiKeys)) {
        data.apiKeys.forEach((key: APIKey) => {
          if (!apiKeysByCategory[key.category]) {
            apiKeysByCategory[key.category] = [];
          }
          apiKeysByCategory[key.category].push(key);
        });
      }
      
      setApiData({
        apiKeysByCategory,
        functionMappings: data.functionMappings || [],
        rateLimits: data.rateLimits || [],
        usageStats: data.usageStats || { byService: {}, byCategory: {} }
      });
    } catch (err: any) {
      console.error('Exception fetching API data:', err);
      setLoadError(`Error loading API keys: ${err.message}`);
    } finally {
      setApiKeysLoading(false);
    }
  };

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

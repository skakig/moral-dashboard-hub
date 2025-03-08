
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface APIKey {
  id: string;
  serviceName: string;
  category: string;
  baseUrl: string;
  isConfigured: boolean;
  isActive: boolean;
  isPrimary: boolean;
  lastValidated: string | null;
  createdAt: string | null;
  validationErrors: string[];
}

interface FunctionMapping {
  id: string;
  function_name: string;
  preferred_service: string | null;
  fallback_service: string | null;
  description?: string;
  updated_at?: string;
}

interface UsageStats {
  byService: Record<string, {
    total: number;
    success: number;
    failed: number;
    avgResponseTime: number;
  }>;
  byCategory: Record<string, {
    total: number;
    success: number;
    failed: number;
    services: Record<string, any>;
  }>;
  recentCalls: any[];
}

interface RateLimit {
  id: string;
  service_name: string;
  requests_used: number;
  request_limit: number;
  reset_date: string;
}

interface APIData {
  apiKeysByCategory: Record<string, APIKey[]>;
  functionMappings: FunctionMapping[];
  usageStats: UsageStats;
  rateLimits: RateLimit[];
}

export function useAPIData() {
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<APIData>({
    apiKeysByCategory: {},
    functionMappings: [],
    usageStats: { byService: {}, byCategory: {}, recentCalls: [] },
    rateLimits: []
  });

  const fetchApiKeysStatus = useCallback(async () => {
    setApiKeysLoading(true);
    setLoadError(null);
    
    try {
      console.log("Fetching API keys status");
      const { data, error } = await supabase.functions.invoke('get-api-keys-status');
      
      if (error) {
        console.error('Failed to fetch API keys status:', error);
        setLoadError(`API keys loading error: ${error.message}`);
        toast.error('Unable to load API key status. Please try again later.');
        return;
      } 
      
      if (data && data.success) {
        console.log("API keys data received:", data.data);
        
        // Check if API keys data is valid
        if (!data.data || typeof data.data !== 'object') {
          console.error('Invalid response format:', data);
          setLoadError('API keys loading error: Invalid response format');
          toast.error('Received invalid data format from server');
          return;
        }
        
        // Apply defaults for empty or missing data
        const formattedData = {
          apiKeysByCategory: data.data.apiKeysByCategory || {},
          functionMappings: data.data.functionMappings || [],
          usageStats: data.data.usageStats || { byService: {}, byCategory: {}, recentCalls: [] },
          rateLimits: data.data.rateLimits || []
        };
        
        setApiData(formattedData);
        
        // Provide user feedback on loaded data
        const totalKeys = Object.values(formattedData.apiKeysByCategory)
          .reduce((acc: number, keys: any[]) => acc + keys.length, 0);
          
        if (totalKeys === 0 && !loadError) {
          toast.info('No API keys found. Add your first API key to get started.');
        } else if (totalKeys > 0 && !loadError) {
          toast.success(`Successfully loaded ${totalKeys} API key(s)`);
        }
      } else {
        const errorMsg = data?.error || 'Invalid response format from API';
        console.error('Invalid response format:', data, errorMsg);
        setLoadError(`API keys loading error: ${errorMsg}`);
        toast.error('Error loading API keys: ' + errorMsg);
      }
    } catch (error) {
      console.error('Failed to fetch API keys status:', error);
      setLoadError(`API keys loading error: ${error.message}`);
      toast.error('Unable to load API key status due to a server error');
    } finally {
      setApiKeysLoading(false);
    }
  }, [loadError]);

  useEffect(() => {
    fetchApiKeysStatus();
  }, [fetchApiKeysStatus]);

  const reloadApiData = () => {
    toast.info('Refreshing API configuration...');
    fetchApiKeysStatus();
  };

  return {
    apiKeysLoading,
    loadError,
    apiData,
    fetchApiKeysStatus,
    reloadApiData
  };
}

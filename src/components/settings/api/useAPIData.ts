
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAPIData() {
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any>({
    apiKeysByCategory: {},
    functionMappings: [],
    usageStats: { byService: {}, byCategory: {} },
    rateLimits: []
  });

  const fetchApiKeysStatus = async () => {
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
        setApiData(data.data);
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
  };

  useEffect(() => {
    fetchApiKeysStatus();
  }, []);

  const reloadApiData = () => {
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

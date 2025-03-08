
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAPIData() {
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [apiData, setApiData] = useState<any>({
    apiKeysByCategory: {},
    functionMappings: [],
    usageStats: { byService: {}, byCategory: {} },
    rateLimits: []
  });

  const fetchApiKeysStatus = async () => {
    setApiKeysLoading(true);
    try {
      console.log("Fetching API keys status");
      const { data, error } = await supabase.functions.invoke('get-api-keys-status');
      
      if (error) {
        console.error('Failed to fetch API keys status:', error);
        toast.error('Unable to load API key status');
      } else if (data && data.success) {
        console.log("API keys data received:", data.data);
        setApiData(data.data);
      } else {
        console.error('Invalid response format:', data);
        toast.error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to fetch API keys status:', error);
      toast.error('Unable to load API key status');
    } finally {
      setApiKeysLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeysStatus();
  }, []);

  return {
    apiKeysLoading,
    apiData,
    fetchApiKeysStatus
  };
}

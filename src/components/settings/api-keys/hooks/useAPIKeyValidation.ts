
import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define validation schema for API keys
export const apiKeySchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  apiKey: z.string().min(3, "API key is required"),
  baseUrl: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
});

export type APIKeyFormValues = z.infer<typeof apiKeySchema>;

interface UseAPIKeyValidationProps {
  serviceName: string;
  category: string;
  onSuccess?: () => void;
  setLoading?: (loading: boolean) => void;
}

export function useAPIKeyValidation({ 
  serviceName, 
  category,
  onSuccess,
  setLoading 
}: UseAPIKeyValidationProps) {
  const [error, setError] = useState<string | null>(null);

  const validateAPIKey = async (values: APIKeyFormValues): Promise<boolean> => {
    setError(null);
    if (setLoading) setLoading(true);
    
    console.info("Submitting API key for validation:", serviceName || values.serviceName);
    console.info("Category:", category);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: {
          serviceName: values.serviceName || serviceName,
          category,
          apiKey: values.apiKey,
          baseUrl: values.baseUrl || "",
          isPrimary: values.isPrimary
        },
      });
      
      if (error) {
        console.error('Error validating API key:', error);
        setError(`Failed to validate ${values.serviceName || serviceName} API key: ${error.message}`);
        toast.error(`Failed to validate ${values.serviceName || serviceName} API key`);
        return false;
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || `Failed to validate ${values.serviceName || serviceName} API key`;
        console.error('Validation failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
      
      console.info("Validation successful:", data);
      
      toast.success(`${values.serviceName || serviceName} API key validated and saved successfully`);
      
      if (onSuccess) {
        // Add a slight delay to ensure the database has time to update
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
      
      return true;
    } catch (err: any) {
      console.error('Exception during validation:', err);
      setError(`Failed to validate ${values.serviceName || serviceName} API key: ${err.message}`);
      toast.error(`Failed to validate ${values.serviceName || serviceName} API key: ${err.message}`);
      return false;
    } finally {
      if (setLoading) setLoading(false);
    }
  };

  return {
    error,
    setError,
    validateAPIKey
  };
}

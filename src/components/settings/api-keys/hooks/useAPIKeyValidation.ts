
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { getCategoryForService } from '../utils/serviceCategories';

export const apiKeySchema = z.object({
  serviceName: z.string().min(1, { message: 'Service name is required' }),
  customServiceName: z.string().optional(),
  apiKey: z.string().min(1, { message: 'API key is required' }),
  baseUrl: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
});

export type APIKeyFormValues = z.infer<typeof apiKeySchema>;

interface UseAPIKeyValidationProps {
  serviceName: string;
  category: string;
  onSuccess?: () => void;
  setLoading: (loading: boolean) => void;
}

export function useAPIKeyValidation({ 
  serviceName, 
  category, 
  onSuccess,
  setLoading
}: UseAPIKeyValidationProps) {
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  const validateAPIKey = async (values: APIKeyFormValues) => {
    setLoading(true);
    setError(null);
    setValidationResult(null);
    
    try {
      console.log("Submitting API key for validation:", values.serviceName);
      console.log("Category:", category || getCategoryForService(values.serviceName));
      
      const requestBody = {
        serviceName: values.serviceName,
        category: category || getCategoryForService(values.serviceName),
        apiKey: values.apiKey,
        baseUrl: values.baseUrl || '',
        isPrimary: values.isPrimary || false,
      };
      
      console.log("Request payload:", JSON.stringify(requestBody));
      
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: requestBody,
      });
      
      if (error) {
        console.error('API validation error:', error);
        setError(error.message || `Failed to validate ${values.serviceName} API key`);
        toast.error(`Failed to validate ${values.serviceName} API key`);
        return false;
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || `Failed to validate ${values.serviceName} API key`;
        console.error('Validation failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
      
      console.log("Validation successful:", data);
      setValidationResult(data);
      
      // Check for validation warnings
      if (data.validationWarnings && data.validationWarnings.length > 0) {
        toast.warning("API key saved with validation warnings");
        console.warn("Validation warnings:", data.validationWarnings);
      } else {
        toast.success(`${values.serviceName} API key validated and saved successfully`);
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (err: any) {
      console.error('Exception during validation:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(`Failed to save ${values.serviceName} API key due to a system error`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    setError,
    validateAPIKey,
    validationResult
  };
}

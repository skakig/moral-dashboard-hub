
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Schema for new API key form
const newApiKeySchema = z.object({
  serviceName: z.string().min(1, { message: 'Service name is required' }),
  apiKey: z.string().min(1, { message: 'API key is required' }),
  baseUrl: z.string().optional(),
});

type FormValues = z.infer<typeof newApiKeySchema>;

interface UseAPIKeyDialogFormProps {
  category: string;
  onSuccess?: () => void;
}

export function useAPIKeyDialogForm({ category, onSuccess }: UseAPIKeyDialogFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationProgress, setValidationProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(newApiKeySchema),
    defaultValues: {
      serviceName: '',
      apiKey: '',
      baseUrl: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setValidationProgress(0);
    
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setValidationProgress(prev => {
        const newProgress = prev + (5 * Math.random());
        return newProgress < 95 ? newProgress : 95;
      });
    }, 150);
    
    try {
      console.log("Submitting API key for validation:", values.serviceName);
      
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: {
          serviceName: values.serviceName,
          // Since we don't have real category in DB, send derived one
          category: category || getCategoryForService(values.serviceName),
          apiKey: values.apiKey,
          baseUrl: values.baseUrl,
        },
      });
      
      // Complete progress
      clearInterval(progressInterval);
      setValidationProgress(100);
      
      if (error) {
        console.error('API validation error:', error);
        setError(error.message || `Failed to validate ${values.serviceName} API key`);
        toast.error(`Failed to validate ${values.serviceName} API key`);
        setLoading(false);
        setTimeout(() => setValidationProgress(0), 1000);
        return;
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || `Failed to validate ${values.serviceName} API key`;
        console.error('Validation failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        setTimeout(() => setValidationProgress(0), 1000);
        return;
      }
      
      toast.success(`${values.serviceName} API key added successfully`);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during validation:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(`Failed to add ${values.serviceName} API key`);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setValidationProgress(0), 1000);
    }
  };

  const useDemoKey = (getTestKey: () => string, needsBaseUrl: boolean, serviceName: string) => {
    if (!serviceName) {
      toast.error("Please select a service first");
      return;
    }
    
    form.setValue('apiKey', getTestKey());
    // Set a sample base URL if needed
    if (needsBaseUrl) {
      form.setValue('baseUrl', `https://api.${serviceName.toLowerCase().replace(/\s+/g, '')}.com/v1`);
    }
  };

  // Helper function to determine category
  const getCategoryForService = (serviceName: string): string => {
    const serviceNameLower = serviceName.toLowerCase();
    
    if (serviceNameLower.includes('openai') || serviceNameLower.includes('anthropic') || serviceNameLower.includes('google')) {
      return 'Text Generation';
    } else if (serviceNameLower.includes('stability') || serviceNameLower.includes('replicate') || serviceNameLower.includes('dalle')) {
      return 'Image Generation';
    } else if (serviceNameLower.includes('runway')) {
      return 'Video Generation';
    } else if (serviceNameLower.includes('facebook') || serviceNameLower.includes('meta') || serviceNameLower.includes('twitter') || serviceNameLower.includes('tiktok')) {
      return 'Social Media';
    }
    
    return 'Other';
  };

  return {
    form,
    loading,
    error,
    validationProgress,
    onSubmit,
    useDemoKey
  };
}

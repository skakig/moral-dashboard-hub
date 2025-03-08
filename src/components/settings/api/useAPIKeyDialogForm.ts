
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
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: {
          serviceName: values.serviceName,
          category,
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
      
      if (!data.success) {
        setError(data.error || `Failed to validate ${values.serviceName} API key`);
        toast.error(data.error || `Failed to validate ${values.serviceName} API key`);
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

  return {
    form,
    loading,
    error,
    validationProgress,
    onSubmit,
    useDemoKey
  };
}

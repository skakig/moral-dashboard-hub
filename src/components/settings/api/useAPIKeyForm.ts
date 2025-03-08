
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const apiKeySchema = z.object({
  apiKey: z.string().min(1, { message: 'API key is required' }),
  baseUrl: z.string().optional(),
});

type APIKeyFormValues = z.infer<typeof apiKeySchema>;

interface UseAPIKeyFormProps {
  serviceName: string;
  category: string;
  baseUrl?: string;
  isConfigured?: boolean;
  onSuccess?: () => void;
}

export function useAPIKeyForm({ 
  serviceName, 
  category, 
  baseUrl = '', 
  isConfigured = false,
  onSuccess 
}: UseAPIKeyFormProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(!isConfigured);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);

  const form = useForm<APIKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: '',
      baseUrl: baseUrl || '',
    },
  });

  // Determine if this service requires a base URL
  const needsBaseUrl = serviceName.toLowerCase().includes('runway') || 
                      serviceName.toLowerCase().includes('custom') ||
                      serviceName.toLowerCase().includes('meta') ||
                      serviceName.toLowerCase().includes('tiktok');

  useEffect(() => {
    // Reset progress when not loading
    if (!loading) {
      setValidationProgress(0);
    }
  }, [loading]);

  useEffect(() => {
    // Simulate progress during validation
    let interval: number | null = null;
    
    if (loading) {
      interval = setInterval(() => {
        setValidationProgress(prev => {
          const newProgress = prev + (5 * Math.random());
          return newProgress < 95 ? newProgress : 95;
        });
      }, 150) as unknown as number;
    } else if (validationProgress > 0) {
      // When done loading, complete the progress bar
      setValidationProgress(100);
      // Reset after animation completes
      const timeout = setTimeout(() => {
        setValidationProgress(0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, validationProgress]);

  const onSubmit = async (values: APIKeyFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Submitting API key for validation:", serviceName);
      
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: {
          serviceName,
          category: category || getCategoryForService(serviceName),
          apiKey: values.apiKey,
          baseUrl: values.baseUrl,
        },
      });
      
      if (error) {
        console.error('API validation error:', error);
        setError(error.message || `Failed to validate ${serviceName} API key`);
        toast.error(`Failed to validate ${serviceName} API key`);
        setLoading(false);
        return;
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || `Failed to validate ${serviceName} API key`;
        console.error('Validation failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      toast.success(`${serviceName} API key validated and saved successfully`);
      form.reset();
      setShowForm(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during validation:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(`Failed to save ${serviceName} API key`);
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async () => {
    setIsToggling(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-api-status', {
        body: {
          serviceName,
          category: category || getCategoryForService(serviceName),
          isActive: !isConfigured || !isToggling,
        },
      });
      
      if (error) {
        console.error('Failed to toggle API status:', error);
        toast.error(`Failed to update ${serviceName} status`);
      } else {
        toast.success(`${serviceName} API ${isConfigured ? 'disabled' : 'enabled'} successfully`);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Failed to toggle API status:', error);
      toast.error(`Failed to update ${serviceName} status`);
    } finally {
      setIsToggling(false);
    }
  };

  const getTestKey = () => {
    // This provides a test key format for demo purposes
    return `TEST_${serviceName.toUpperCase().replace(/\s+/g, '_')}_KEY_123`;
  };

  const useDemoKey = () => {
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
    showForm,
    setShowForm,
    error,
    isToggling,
    validationProgress,
    needsBaseUrl,
    onSubmit,
    toggleActiveStatus,
    useDemoKey
  };
}

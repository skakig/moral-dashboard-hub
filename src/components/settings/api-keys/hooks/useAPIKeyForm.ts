
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useValidationProgress } from './useValidationProgress';
import { useAPIKeyValidation, apiKeySchema, APIKeyFormValues } from './useAPIKeyValidation';
import { useAPIStatusToggle } from './useAPIStatusToggle';
import { needsBaseUrlForService, getTestKeyForService } from '../constants';
import { supabase } from '@/integrations/supabase/client';

interface UseAPIKeyFormProps {
  id?: string;
  serviceName: string;
  category: string;
  baseUrl?: string;
  isConfigured?: boolean;
  isActive?: boolean;
  isPrimary?: boolean;
  onSuccess?: () => void;
}

export function useAPIKeyForm({ 
  id,
  serviceName, 
  category, 
  baseUrl = '', 
  isConfigured = false,
  isActive = true,
  isPrimary = false,
  onSuccess 
}: UseAPIKeyFormProps) {
  const [showForm, setShowForm] = useState(!isConfigured);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Setup form with validation schema
  const form = useForm<APIKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      serviceName: serviceName,
      apiKey: '',
      baseUrl: baseUrl || '',
      isPrimary: isPrimary
    },
  });

  // Progress animation handling
  const { loading, setLoading, validationProgress } = useValidationProgress();
  
  // API key validation
  const { error, setError, validateAPIKey } = useAPIKeyValidation({
    serviceName,
    category,
    onSuccess,
    setLoading
  });
  
  // API status toggle
  const { isToggling, toggleActiveStatus } = useAPIStatusToggle({
    id,
    serviceName,
    category,
    isConfigured,
    isActive,
    onSuccess
  });

  // Determine if this service requires a base URL
  const needsBaseUrl = needsBaseUrlForService(serviceName);

  const onSubmit = async (values: APIKeyFormValues) => {
    // If we have an ID, this is an update
    if (id) {
      setIsUpdating(true);
      try {
        const { data, error } = await supabase.functions.invoke('update-api-key', {
          body: {
            id,
            apiKey: values.apiKey,
            baseUrl: values.baseUrl,
            isPrimary: values.isPrimary
          },
        });
        
        if (error) {
          console.error('Error updating API key:', error);
          toast.error(`Failed to update ${serviceName} API key`);
          return;
        }
        
        if (!data || !data.success) {
          const errorMsg = data?.error || `Failed to update ${serviceName} API key`;
          console.error('Update failed:', errorMsg);
          toast.error(errorMsg);
          return;
        }
        
        toast.success(`${serviceName} API key updated successfully`);
        
        if (data.validationWarnings && data.validationWarnings.length > 0) {
          toast.warning(`API key saved with validation warnings`);
        }
        
        form.reset();
        setShowForm(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        console.error('Exception during update:', err);
        toast.error(`Failed to update ${serviceName} API key: ${err.message}`);
      } finally {
        setIsUpdating(false);
      }
    } else {
      // New key validation
      const success = await validateAPIKey(values);
      if (success) {
        form.reset();
        setShowForm(false);
      }
    }
  };

  const useDemoKey = () => {
    form.setValue('apiKey', getTestKeyForService(serviceName));
    // Set a sample base URL if needed
    if (needsBaseUrl) {
      form.setValue('baseUrl', `https://api.${serviceName.toLowerCase().replace(/\s+/g, '')}.com/v1`);
    }
  };

  return {
    form,
    loading: loading || isUpdating,
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

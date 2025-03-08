
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useValidationProgress } from './hooks/useValidationProgress';
import { useAPIKeyValidation, apiKeySchema, APIKeyFormValues } from './hooks/useAPIKeyValidation';
import { useAPIStatusToggle } from './hooks/useAPIStatusToggle';
import { needsBaseUrlForService, getTestKeyForService } from './utils/serviceCategories';

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
  const [showForm, setShowForm] = useState(!isConfigured);
  
  // Setup form with validation schema
  const form = useForm<APIKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      serviceName: serviceName,
      apiKey: '',
      baseUrl: baseUrl || '',
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
    serviceName,
    category,
    isConfigured,
    onSuccess
  });

  // Determine if this service requires a base URL
  const needsBaseUrl = needsBaseUrlForService(serviceName);

  const onSubmit = async (values: APIKeyFormValues) => {
    const success = await validateAPIKey(values);
    if (success) {
      form.reset();
      setShowForm(false);
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

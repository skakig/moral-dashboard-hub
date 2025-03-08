
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiKeySchema, APIKeyFormValues, useAPIKeyValidation } from './useAPIKeyValidation';
import { useValidationProgress } from './useValidationProgress';
import { getCategoryForService } from '../utils/serviceCategories';

interface UseAPIKeyDialogFormProps {
  category: string;
  onSuccess?: () => void;
}

export function useAPIKeyDialogForm({ category, onSuccess }: UseAPIKeyDialogFormProps) {
  const [serviceName, setServiceName] = useState<string>('');
  
  // Setup form with validation schema
  const form = useForm<APIKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      serviceName: '',
      apiKey: '',
      baseUrl: '',
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

  const onSubmit = async (values: APIKeyFormValues) => {
    const success = await validateAPIKey(values);
    if (success) {
      form.reset();
    }
  };

  const useDemoKey = (getTestKey: (serviceName: string) => string, needsBaseUrl: boolean, serviceName: string) => {
    if (!serviceName) return;
    
    form.setValue('apiKey', getTestKey(serviceName));
    
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

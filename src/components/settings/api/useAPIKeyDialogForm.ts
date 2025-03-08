
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useValidationProgress } from './hooks/useValidationProgress';
import { useAPIKeyValidation, apiKeySchema } from './hooks/useAPIKeyValidation';
import { getCategoryForService } from './utils/serviceCategories';

type FormValues = z.infer<typeof apiKeySchema>;

interface UseAPIKeyDialogFormProps {
  category: string;
  onSuccess?: () => void;
}

export function useAPIKeyDialogForm({ category, onSuccess }: UseAPIKeyDialogFormProps) {
  const { 
    loading, 
    setLoading, 
    validationProgress 
  } = useValidationProgress();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      serviceName: '',
      apiKey: '',
      baseUrl: '',
    },
  });

  const { error, validateAPIKey } = useAPIKeyValidation({
    serviceName: form.getValues().serviceName,
    category,
    onSuccess,
    setLoading
  });

  const onSubmit = async (values: FormValues) => {
    await validateAPIKey(values);
    if (!error) {
      form.reset();
    }
  };

  const useDemoKey = (getTestKey: () => string, needsBaseUrl: boolean, serviceName: string) => {
    if (!serviceName) {
      console.error("Service name is required for demo key");
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

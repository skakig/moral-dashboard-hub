
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define the schema for function mapping
export const functionMappingSchema = z.object({
  functionName: z.string().min(1, { message: 'Function name is required' }),
  preferredService: z.string().min(1, { message: 'Preferred service is required' }),
  fallbackService: z.string().optional(),
});

export type FunctionMappingFormValues = z.infer<typeof functionMappingSchema>;

interface UseAddFunctionMappingFormProps {
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useAddFunctionMappingForm({ onSuccess, onOpenChange }: UseAddFunctionMappingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FunctionMappingFormValues>({
    resolver: zodResolver(functionMappingSchema),
    defaultValues: {
      functionName: '',
      preferredService: '',
      fallbackService: '',
    },
  });

  const onSubmit = async (values: FunctionMappingFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-api-function-mapping', {
        body: {
          functionName: values.functionName,
          preferredService: values.preferredService,
          fallbackService: values.fallbackService || null,
        },
      });
      
      if (error) {
        console.error('Error adding function mapping:', error);
        setError(error.message || `Failed to add function mapping`);
        setIsLoading(false);
        return;
      }
      
      if (!data.success) {
        setError(data.error || `Failed to add function mapping`);
        setIsLoading(false);
        return;
      }
      
      toast.success(`Function mapping added successfully`);
      form.reset();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during function mapping creation:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    onSubmit,
    setError
  };
}

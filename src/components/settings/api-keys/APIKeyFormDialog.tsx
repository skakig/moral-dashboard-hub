
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { APIKeyValidationProgress } from './APIKeyValidationProgress';
import { APIKeyErrorDisplay } from './APIKeyErrorDisplay';
import { useValidationProgress } from './hooks/useValidationProgress';
import { ServiceSelection } from './ServiceSelection';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const apiKeyFormSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  apiKey: z.string().min(3, "API key is required"),
  baseUrl: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
  category: z.string().min(1, "Category is required"),
});

type APIKeyFormValues = z.infer<typeof apiKeyFormSchema>;

interface APIKeyFormDialogProps {
  category?: string;
  defaultService?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function APIKeyFormDialog({ 
  category = '', 
  defaultService = '',
  onSuccess,
  onCancel
}: APIKeyFormDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const { loading, setLoading, validationProgress } = useValidationProgress();
  
  const form = useForm<APIKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      serviceName: defaultService,
      apiKey: '',
      baseUrl: '',
      isPrimary: false,
      category: category,
    },
  });

  async function onSubmit(values: APIKeyFormValues) {
    setError(null);
    setLoading(true);
    
    console.log("Submitting API key for validation:", values.serviceName);
    console.log("Category:", values.category);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: {
          serviceName: values.serviceName,
          category: values.category,
          apiKey: values.apiKey,
          baseUrl: values.baseUrl || "",
          isPrimary: values.isPrimary
        },
      });
      
      if (error) {
        console.error('Error validating API key:', error);
        setError(`Failed to validate ${values.serviceName} API key: ${error.message}`);
        toast.error(`Failed to validate ${values.serviceName} API key`);
        return;
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || `Failed to validate ${values.serviceName} API key`;
        console.error('Validation failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      console.log("Validation successful:", data);
      toast.success(`${values.serviceName} API key validated and saved successfully`);
      
      form.reset();
      
      if (onSuccess) {
        // Add a slight delay to ensure the database has time to update
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Exception during validation:', err);
      setError(`Failed to validate ${values.serviceName} API key: ${err.message}`);
      toast.error(`Failed to validate ${values.serviceName} API key: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const needsBaseUrl = form.watch('serviceName') && [
    'Stability AI', 
    'Custom API'
  ].includes(form.watch('serviceName'));

  const useDemoKey = () => {
    const service = form.getValues('serviceName');
    if (!service) return;
    
    let demoKey = `TEST_${service.toLowerCase().replace(/\s+/g, '-')}-api-key`;
    form.setValue('apiKey', demoKey);
    
    if (needsBaseUrl) {
      form.setValue('baseUrl', `https://api.${service.toLowerCase().replace(/\s+/g, '')}.com/v1`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  {...field}
                >
                  <option value="">Select a category</option>
                  <option value="Text Generation">Text Generation</option>
                  <option value="Image Generation">Image Generation</option>
                  <option value="Video Generation">Video Generation</option>
                  <option value="Audio Generation">Audio Generation</option>
                  <option value="Voice Generation">Voice Generation</option>
                  <option value="Embeddings">Embeddings</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="serviceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <FormControl>
                <ServiceSelection
                  {...field}
                  category={form.watch('category')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter API key" 
                  type="password" 
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {needsBaseUrl && (
          <FormField
            control={form.control}
            name="baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base URL (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="https://api.example.com/v1" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="isPrimary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Set as Primary</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Primary keys are used by default for this category
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {error && <APIKeyErrorDisplay error={error} />}
        
        {loading && <APIKeyValidationProgress progress={validationProgress} />}
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={useDemoKey}
              disabled={loading || !form.watch('serviceName')}
            >
              Use Demo Key
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Validating..." : "Save API Key"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

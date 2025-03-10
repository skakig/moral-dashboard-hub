
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { apiKeySchema, APIKeyFormValues } from './hooks/useAPIKeyValidation';
import { APIKeyErrorDisplay } from './APIKeyErrorDisplay';
import { APIKeyValidationProgress } from './APIKeyValidationProgress';

interface APIKeyFormFieldsProps {
  form: UseFormReturn<APIKeyFormValues>;
  needsBaseUrl: boolean;
  loading: boolean;
  error: string | null;
  validationProgress: number;
  onSubmit: (values: APIKeyFormValues) => Promise<void>;
  useDemoKey: () => void;
  serviceName: string;
}

export function APIKeyFormFields({ 
  form, 
  needsBaseUrl, 
  loading, 
  error, 
  validationProgress,
  onSubmit,
  useDemoKey,
  serviceName 
}: APIKeyFormFieldsProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder={`Enter your ${serviceName} API key`}
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
                <FormLabel>Base URL {serviceName.toLowerCase().includes('custom') ? '' : '(Optional)'}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={`e.g., https://api.${serviceName.toLowerCase().replace(/\s+/g, '')}.com/v1`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <APIKeyErrorDisplay error={error} />
        <APIKeyValidationProgress loading={loading} progress={validationProgress} />

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>Validate & Save API Key</>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={useDemoKey}
            disabled={loading}
            className="w-full"
          >
            Use Demo Key
          </Button>
        </div>
      </form>
    </Form>
  );
}

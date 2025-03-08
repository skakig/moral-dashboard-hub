
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  showPrimaryOption?: boolean;
}

export function APIKeyFormFields({ 
  form, 
  needsBaseUrl, 
  loading, 
  error, 
  validationProgress,
  onSubmit,
  useDemoKey,
  serviceName,
  showPrimaryOption = false
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
        
        {showPrimaryOption && (
          <FormField
            control={form.control}
            name="isPrimary"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Set as primary API key
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    This key will be used as the preferred service for all related functions.
                  </p>
                </div>
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


import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAPIKeyDialogForm } from './hooks/useAPIKeyDialogForm';
import { useServiceSelection } from './hooks/useServiceSelection';
import { ServiceSelection } from './ServiceSelection';
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { APIKeyErrorDisplay } from './APIKeyErrorDisplay';
import { APIKeyValidationProgress } from './APIKeyValidationProgress';

interface APIKeyFormDialogProps {
  category: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function APIKeyFormDialog({ category, onSuccess, onCancel }: APIKeyFormDialogProps) {
  const { 
    serviceName, 
    setServiceName, 
    needsBaseUrl, 
    getTestKey, 
    suggestedServices 
  } = useServiceSelection({ category });
  
  const { 
    form, 
    loading, 
    error, 
    validationProgress, 
    onSubmit, 
    useDemoKey 
  } = useAPIKeyDialogForm({ category, onSuccess });

  const handleDemoKey = () => {
    useDemoKey(getTestKey, needsBaseUrl, serviceName);
  };

  const handleServiceChange = (value: string) => {
    setServiceName(value);
    form.setValue('serviceName', value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ServiceSelection 
          form={form} 
          suggestedServices={suggestedServices} 
          onServiceChange={handleServiceChange} 
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
                  type="password"
                  placeholder="Enter API key"
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
                <FormLabel>Base URL {serviceName?.toLowerCase().includes('custom') ? '' : '(Optional)'}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={serviceName ? `e.g., https://api.${serviceName.toLowerCase().replace(/\s+/g, '')}.com/v1` : "e.g., https://api.example.com/v1"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <APIKeyErrorDisplay error={error} />
        <APIKeyValidationProgress loading={loading} progress={validationProgress} />

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
              <>Add API Key</>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleDemoKey}
            disabled={loading || !serviceName}
            className="w-full"
          >
            Use Demo Key
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

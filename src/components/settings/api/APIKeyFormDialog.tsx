
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAPIKeyDialogForm } from './useAPIKeyDialogForm';
import { useServiceSelection } from './useServiceSelection';
import { ServiceSelection } from './ServiceSelection';
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { APIKeyErrorDisplay } from './APIKeyErrorDisplay';
import { APIKeyValidationProgress } from './APIKeyValidationProgress';

interface APIKeyFormDialogProps {
  category: string;
  onSuccess?: () => void;
}

export function APIKeyFormDialog({ category, onSuccess }: APIKeyFormDialogProps) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ServiceSelection 
          form={form} 
          suggestedServices={suggestedServices} 
          onServiceChange={setServiceName} 
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
        </div>
      </form>
    </Form>
  );
}

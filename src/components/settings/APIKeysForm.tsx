
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, CheckCircle2, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const apiKeySchema = z.object({
  apiKey: z.string().min(1, { message: 'API key is required' }),
});

type ApiKeyService = {
  serviceName: string;
  isConfigured: boolean;
  isActive: boolean;
  lastValidated: string | null;
};

interface APIKeysFormProps {
  title: string;
  description: string;
  serviceName: string;
  onSuccess?: () => void;
}

export function APIKeysForm({ title, description, serviceName, onSuccess }: APIKeysFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ApiKeyService | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: '',
    },
  });

  useEffect(() => {
    fetchApiKeyStatus();
  }, [serviceName]);

  const fetchApiKeyStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-api-keys-status');
      
      if (error) {
        console.error('Error fetching API key status:', error);
        return;
      }
      
      if (data && data.success && data.data) {
        const serviceStatus = data.data.find((s: ApiKeyService) => s.serviceName === serviceName);
        if (serviceStatus) {
          setStatus(serviceStatus);
        }
      }
    } catch (err) {
      console.error('Failed to fetch API key status:', err);
    }
  };

  const onSubmit = async (values: z.infer<typeof apiKeySchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: {
          serviceName,
          apiKey: values.apiKey,
        },
      });
      
      if (error || !data.success) {
        setError(error?.message || data.error || 'Failed to validate API key');
        toast.error(`Failed to validate ${serviceName} API key`);
        return;
      }
      
      toast.success(`${serviceName} API key validated and saved successfully`);
      form.reset();
      fetchApiKeyStatus();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast.error('Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {title}
          {status?.isConfigured && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.isConfigured ? (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              API key configured successfully
              {status.lastValidated && (
                <span className="text-xs block text-green-600">
                  Last validated: {new Date(status.lastValidated).toLocaleString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        ) : (
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
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
            </form>
          </Form>
        )}
      </CardContent>
      {status?.isConfigured && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => setStatus({...status, isConfigured: false})}
            className="w-full"
          >
            Update API Key
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

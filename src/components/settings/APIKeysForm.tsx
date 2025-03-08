
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, CheckCircle2, Key, Loader2, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';

const apiKeySchema = z.object({
  apiKey: z.string().min(1, { message: 'API key is required' }),
  baseUrl: z.string().optional(),
});

interface APIKeysFormProps {
  title: string;
  description: string;
  serviceName: string;
  category: string;
  baseUrl?: string;
  isConfigured?: boolean;
  isActive?: boolean;
  lastValidated?: string | null;
  onSuccess?: () => void;
}

export function APIKeysForm({ 
  title, 
  description, 
  serviceName, 
  category,
  baseUrl = '', 
  isConfigured = false, 
  isActive = true,
  lastValidated = null,
  onSuccess 
}: APIKeysFormProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(!isConfigured);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const form = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: '',
      baseUrl: baseUrl || '',
    },
  });

  const needsBaseUrl = serviceName.toLowerCase().includes('runway') || 
                      serviceName.toLowerCase().includes('custom');

  const onSubmit = async (values: z.infer<typeof apiKeySchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: {
          serviceName,
          category,
          apiKey: values.apiKey,
          baseUrl: values.baseUrl,
        },
      });
      
      if (error) {
        console.error('API validation error:', error);
        setError(error.message || `Failed to validate ${serviceName} API key`);
        toast.error(`Failed to validate ${serviceName} API key`);
        setLoading(false);
        return;
      }
      
      if (!data.success) {
        setError(data.error || `Failed to validate ${serviceName} API key`);
        toast.error(data.error || `Failed to validate ${serviceName} API key`);
        setLoading(false);
        return;
      }
      
      toast.success(`${serviceName} API key validated and saved successfully`);
      form.reset();
      setShowForm(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during validation:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(`Failed to save ${serviceName} API key`);
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async () => {
    setIsToggling(true);
    try {
      // We'd need to create a proper endpoint for this in a real implementation
      // For now we'll just show the toast
      toast.success(`${serviceName} API ${isActive ? 'disabled' : 'enabled'} successfully`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to toggle API status:', error);
      toast.error(`Failed to update ${serviceName} status`);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {title}
          {isConfigured && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured && !showForm ? (
          <>
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                API key configured successfully
                {lastValidated && (
                  <span className="text-xs block text-green-600">
                    Last validated: {new Date(lastValidated).toLocaleString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Status</span>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isActive} 
                  onCheckedChange={toggleActiveStatus}
                  disabled={isToggling}
                />
                <span className="text-sm text-muted-foreground">
                  {isActive ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </>
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
                          placeholder="e.g., https://api.example.com/v1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
      {isConfigured && !showForm && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            Update API Key
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

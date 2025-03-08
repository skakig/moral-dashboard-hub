
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// Define suggested services by category
const SUGGESTED_SERVICES = {
  "Text Generation": ["OpenAI", "Anthropic", "Mistral AI"],
  "Voice Generation": ["ElevenLabs", "OpenAI TTS"],
  "Image Generation": ["Stable Diffusion", "DALL-E"],
  "Video Generation": ["RunwayML", "Pika Labs"],
  "Social Media": ["Meta API", "TikTok API", "YouTube API", "Twitter/X API"]
};

// Schema for new API key form
const newApiKeySchema = z.object({
  serviceName: z.string().min(1, { message: 'Service name is required' }),
  apiKey: z.string().min(1, { message: 'API key is required' }),
  baseUrl: z.string().optional(),
});

interface APIKeyFormDialogProps {
  category: string;
  onSuccess?: () => void;
}

export function APIKeyFormDialog({ category, onSuccess }: APIKeyFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationProgress, setValidationProgress] = useState(0);

  const form = useForm<z.infer<typeof newApiKeySchema>>({
    resolver: zodResolver(newApiKeySchema),
    defaultValues: {
      serviceName: '',
      apiKey: '',
      baseUrl: '',
    },
  });

  const watchedServiceName = form.watch('serviceName');
  const needsBaseUrl = watchedServiceName?.toLowerCase().includes('runway') || 
                        watchedServiceName?.toLowerCase().includes('custom') ||
                        watchedServiceName?.toLowerCase().includes('meta') ||
                        watchedServiceName?.toLowerCase().includes('tiktok');

  const onSubmit = async (values: z.infer<typeof newApiKeySchema>) => {
    setLoading(true);
    setError(null);
    setValidationProgress(0);
    
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setValidationProgress(prev => {
        const newProgress = prev + (5 * Math.random());
        return newProgress < 95 ? newProgress : 95;
      });
    }, 150);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: {
          serviceName: values.serviceName,
          category,
          apiKey: values.apiKey,
          baseUrl: values.baseUrl,
        },
      });
      
      // Complete progress
      clearInterval(progressInterval);
      setValidationProgress(100);
      
      if (error) {
        console.error('API validation error:', error);
        setError(error.message || `Failed to validate ${values.serviceName} API key`);
        toast.error(`Failed to validate ${values.serviceName} API key`);
        setLoading(false);
        setTimeout(() => setValidationProgress(0), 1000);
        return;
      }
      
      if (!data.success) {
        setError(data.error || `Failed to validate ${values.serviceName} API key`);
        toast.error(data.error || `Failed to validate ${values.serviceName} API key`);
        setLoading(false);
        setTimeout(() => setValidationProgress(0), 1000);
        return;
      }
      
      toast.success(`${values.serviceName} API key added successfully`);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during validation:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(`Failed to add ${values.serviceName} API key`);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setValidationProgress(0), 1000);
    }
  };

  const getTestKey = () => {
    // This provides a test key format for demo purposes
    if (!watchedServiceName) return '';
    return `TEST_${watchedServiceName.toUpperCase().replace(/\s+/g, '_')}_KEY_123`;
  };

  const useDemoKey = () => {
    if (!watchedServiceName) {
      toast.error("Please select a service first");
      return;
    }
    
    form.setValue('apiKey', getTestKey());
    // Set a sample base URL if needed
    if (needsBaseUrl) {
      form.setValue('baseUrl', `https://api.${watchedServiceName.toLowerCase().replace(/\s+/g, '')}.com/v1`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="serviceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Suggested services for this category */}
                  {SUGGESTED_SERVICES[category as keyof typeof SUGGESTED_SERVICES]?.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom">Custom Service</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedServiceName === 'Custom' && (
          <FormItem>
            <FormLabel>Custom Service Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter custom service name"
                onChange={(e) => form.setValue('serviceName', e.target.value)}
              />
            </FormControl>
          </FormItem>
        )}

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
                <FormLabel>Base URL {watchedServiceName?.toLowerCase().includes('custom') ? '' : '(Optional)'}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={watchedServiceName ? `e.g., https://api.${watchedServiceName.toLowerCase().replace(/\s+/g, '')}.com/v1` : "e.g., https://api.example.com/v1"}
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

        {loading && validationProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Validating API key...</span>
              <span>{Math.round(validationProgress)}%</span>
            </div>
            <Progress value={validationProgress} />
          </div>
        )}

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
            onClick={useDemoKey}
            disabled={loading || !watchedServiceName}
            className="w-full"
          >
            Use Demo Key
          </Button>
        </div>
      </form>
    </Form>
  );
}

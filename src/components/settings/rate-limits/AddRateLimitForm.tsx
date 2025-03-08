
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

import { rateLimitSchema, RateLimitFormValues } from './schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddRateLimitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddRateLimitForm({ onSuccess, onCancel }: AddRateLimitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<RateLimitFormValues>({
    resolver: zodResolver(rateLimitSchema),
    defaultValues: {
      serviceName: '',
      requestLimit: 1000,
      resetDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
    },
  });

  const onSubmit = async (values: RateLimitFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call to create/update rate limit would go here
      // For now, we'll just show a success toast
      toast.success(`Rate limit for ${values.serviceName} added successfully`);
      form.reset();
      onSuccess();
    } catch (err: any) {
      console.error('Exception during rate limit creation:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
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
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., OpenAI"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="requestLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Limit</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="e.g., 1000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="resetDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reset Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
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

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Add Rate Limit</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

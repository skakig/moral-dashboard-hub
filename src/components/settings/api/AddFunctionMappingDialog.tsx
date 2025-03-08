
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the schema for function mapping
const functionMappingSchema = z.object({
  functionName: z.string().min(1, { message: 'Function name is required' }),
  preferredService: z.string().min(1, { message: 'Preferred service is required' }),
  fallbackService: z.string().optional(),
});

interface AddFunctionMappingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableServices: string[];
  onSuccess?: () => void;
}

export function AddFunctionMappingDialog({ 
  isOpen, 
  onOpenChange, 
  availableServices, 
  onSuccess 
}: AddFunctionMappingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof functionMappingSchema>>({
    resolver: zodResolver(functionMappingSchema),
    defaultValues: {
      functionName: '',
      preferredService: '',
      fallbackService: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof functionMappingSchema>) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Function Mapping</DialogTitle>
          <DialogDescription>
            Map a custom function to an API service
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="functionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Function Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Custom AI Analysis"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferredService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Service</FormLabel>
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
                      {availableServices.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fallbackService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fallback Service (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fallback service..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {availableServices.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Add Mapping</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FUNCTION_CATEGORIES } from './constants';

const functionMappingSchema = z.object({
  functionName: z.string().min(1, { message: 'Function name is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().optional(),
  preferredService: z.string().optional(),
});

type FunctionMappingFormValues = z.infer<typeof functionMappingSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get categories from FUNCTION_CATEGORIES
  const categories = Object.keys(FUNCTION_CATEGORIES);
  
  const form = useForm<FunctionMappingFormValues>({
    resolver: zodResolver(functionMappingSchema),
    defaultValues: {
      functionName: '',
      category: '',
      description: '',
      preferredService: '',
    },
  });

  const onSubmit = async (values: FunctionMappingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-api-function-mapping', {
        body: {
          functionName: values.functionName,
          category: values.category,
          description: values.description,
          serviceName: values.preferredService
        },
      });
      
      if (error) {
        console.error('Error adding function mapping:', error);
        toast.error('Failed to add function mapping');
        return;
      }
      
      toast.success(`Added function mapping for ${values.functionName}`);
      
      form.reset();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during function mapping creation:', err);
      toast.error(`Failed to add function mapping: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Function Mapping</DialogTitle>
          <DialogDescription>
            Create a new function mapping to determine which API service to use for specific features
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
                    <Input {...field} placeholder="e.g., generateImage" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="What does this function do?" 
                      className="resize-none"
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
                  <FormLabel>Preferred Service (Optional)</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Not configured</SelectItem>
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
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                Add Mapping
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

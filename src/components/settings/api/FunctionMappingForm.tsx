
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FunctionMappingFormValues } from './useAddFunctionMappingForm';

interface FunctionMappingFormProps {
  form: UseFormReturn<FunctionMappingFormValues>;
  availableServices: string[];
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: FunctionMappingFormValues) => void;
}

export function FunctionMappingForm({ 
  form, 
  availableServices, 
  isLoading, 
  error, 
  onSubmit 
}: FunctionMappingFormProps) {
  return (
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
  );
}

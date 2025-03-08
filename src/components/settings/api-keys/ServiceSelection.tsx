
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { APIKeyFormValues } from './hooks/useAPIKeyValidation';

interface ServiceSelectionProps {
  form: UseFormReturn<APIKeyFormValues>;
  suggestedServices: string[];
  onServiceChange: (value: string) => void;
}

export function ServiceSelection({ form, suggestedServices, onServiceChange }: ServiceSelectionProps) {
  return (
    <FormField
      control={form.control}
      name="serviceName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service</FormLabel>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              onServiceChange(value);
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select API service" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {suggestedServices.map((service) => (
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
  );
}


import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
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
          <FormControl>
            <Select 
              value={field.value} 
              onValueChange={(value) => {
                field.onChange(value);
                onServiceChange(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {suggestedServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

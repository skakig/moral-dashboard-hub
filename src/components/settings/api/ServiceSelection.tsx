
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { APIKeyFormValues } from './hooks/useAPIKeyValidation';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface ServiceSelectionProps {
  form: UseFormReturn<APIKeyFormValues>;
  suggestedServices: string[];
  onServiceChange: (value: string) => void;
  allowCustom?: boolean;
}

export function ServiceSelection({ 
  form, 
  suggestedServices, 
  onServiceChange,
  allowCustom = true
}: ServiceSelectionProps) {
  const [customService, setCustomService] = useState(false);
  
  const handleServiceChange = (value: string) => {
    setCustomService(value === 'Custom Service');
    onServiceChange(value);
  };

  return (
    <div className="space-y-4">
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
                  handleServiceChange(value);
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
                    {allowCustom && (
                      <SelectItem value="Custom Service">Custom Service</SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {customService && (
        <FormField
          control={form.control}
          name="customServiceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Service Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter custom service name"
                  onChange={(e) => {
                    field.onChange(e);
                    // Update service name with custom value
                    if (e.target.value) {
                      form.setValue('serviceName', e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}


import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { APIKeyFormValues } from "./hooks/useAPIKeyValidation";

interface ServiceSelectionProps {
  form: UseFormReturn<APIKeyFormValues>;
  suggestedServices: string[];
  onServiceChange: (value: string) => void;
}

export function ServiceSelection({ 
  form, 
  suggestedServices, 
  onServiceChange 
}: ServiceSelectionProps) {
  const showCustomInput = form.watch('serviceName')?.toLowerCase().includes('custom');
  
  const handleServiceSelection = (value: string) => {
    form.setValue('serviceName', value);
    onServiceChange(value);
    
    // Clear custom service name when not selecting a custom option
    if (!value.toLowerCase().includes('custom')) {
      form.setValue('customServiceName', undefined);
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="serviceName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service</FormLabel>
            <Select
              value={field.value}
              onValueChange={handleServiceSelection}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
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
      
      {showCustomInput && (
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
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e);
                    // Also update the main service name to include the custom value
                    if (e.target.value) {
                      const customName = `Custom (${e.target.value})`;
                      form.setValue('serviceName', customName);
                      onServiceChange(customName);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}


import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import * as z from 'zod';

interface ServiceSelectionProps {
  form: UseFormReturn<any>;
  suggestedServices: string[];
  onServiceChange: (value: string) => void;
}

export function ServiceSelection({ form, suggestedServices, onServiceChange }: ServiceSelectionProps) {
  const watchedServiceName = form.watch('serviceName');

  return (
    <>
      <FormField
        control={form.control}
        name="serviceName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Name</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                onServiceChange(value);
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select service..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {suggestedServices.map((service) => (
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
              onChange={(e) => {
                form.setValue('serviceName', e.target.value);
                onServiceChange(e.target.value);
              }}
            />
          </FormControl>
        </FormItem>
      )}
    </>
  );
}

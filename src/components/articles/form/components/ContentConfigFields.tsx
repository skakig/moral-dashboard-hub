
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface ContentConfigFieldsProps {
  form: UseFormReturn<any>;
  setContentLength: (value: string) => void;
}

export function ContentConfigFields({ form, setContentLength }: ContentConfigFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="contentLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content Length</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setContentLength(value);
              }}
              defaultValue={field.value || "medium"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select content length" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="short">Short (300-500 words)</SelectItem>
                <SelectItem value="medium">Medium (1000-1500 words)</SelectItem>
                <SelectItem value="long">Long (2000-3000 words)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="moralLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Moral Level (1-9)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={9}
                {...field}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 9) {
                    field.onChange(value);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

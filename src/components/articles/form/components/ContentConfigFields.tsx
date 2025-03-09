
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
            <FormLabel>Moral Level</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(parseInt(value))}
              defaultValue={field.value?.toString() || "5"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select moral level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

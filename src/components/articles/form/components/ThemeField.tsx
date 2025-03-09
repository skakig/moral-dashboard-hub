
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ThemeFieldProps {
  form: UseFormReturn<any>;
}

export function ThemeField({ form }: ThemeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="theme"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Describe what you want to generate</FormLabel>
          <FormControl>
            <Textarea
              placeholder="e.g., Create a YouTube script comparing Calvin & Hobbes to The Far Side and explain where each falls in TMH"
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

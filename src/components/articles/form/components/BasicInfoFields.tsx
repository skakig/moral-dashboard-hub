
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useSEOGeneration } from "../hooks/useSEOGeneration";

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
}

export function BasicInfoFields({ form }: BasicInfoFieldsProps) {
  const { generateSEOData } = useSEOGeneration(form);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Theme/Topic</FormLabel>
            <FormControl>
              <Input placeholder="Enter theme or topic..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="keywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between">
              <span>Keywords (comma separated)</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={generateSEOData}
                className="h-6 px-2 text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Generate
              </Button>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="moral hierarchy, ethics, etc."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

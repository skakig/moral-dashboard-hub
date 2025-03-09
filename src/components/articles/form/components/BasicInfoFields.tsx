
import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useSEOGeneration } from "../hooks/useSEOGeneration";
import { useContentThemes } from "@/hooks/useContentThemes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
}

export function BasicInfoFields({ form }: BasicInfoFieldsProps) {
  const { generateSEOData } = useSEOGeneration(form);
  const { themes, isLoading: themesLoading } = useContentThemes();
  const [customTheme, setCustomTheme] = useState("");

  const handleThemeChange = (value: string) => {
    if (value === "custom") {
      form.setValue("theme", customTheme);
    } else {
      form.setValue("theme", value);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Theme/Topic</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Select 
                  onValueChange={handleThemeChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading themes...
                      </SelectItem>
                    ) : (
                      themes?.map((theme) => (
                        <SelectItem key={theme.id} value={theme.name}>
                          {theme.name}
                        </SelectItem>
                      ))
                    )}
                    <SelectItem value="custom">Custom Theme</SelectItem>
                  </SelectContent>
                </Select>
                
                {field.value === "custom" && (
                  <Input
                    placeholder="Enter custom theme..."
                    value={customTheme}
                    onChange={(e) => {
                      setCustomTheme(e.target.value);
                      form.setValue("theme", e.target.value);
                    }}
                  />
                )}
              </div>
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

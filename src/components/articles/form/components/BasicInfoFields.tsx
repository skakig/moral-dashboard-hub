
import React, { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useSEOGeneration } from "../hooks/useSEOGeneration";
import { useContentThemes } from "@/hooks/useContentThemes";
import { useAIGeneration } from "../hooks/useAIGeneration";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
}

export function BasicInfoFields({ form }: BasicInfoFieldsProps) {
  const { generateSEOData } = useSEOGeneration(form);
  const { generateKeywords, loading: keywordsLoading } = useAIGeneration();
  const { themes, isLoading: themesLoading } = useContentThemes();
  const [customTheme, setCustomTheme] = useState("");

  // Auto-generate keywords when theme or platform changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if ((value.theme && value.theme !== 'custom') || value.platform) {
        const theme = value.theme || '';
        const platform = value.platform || '';
        const contentType = value.contentType || '';
        
        if (theme && platform && contentType) {
          handleAutoGenerateKeywords(theme, platform, contentType);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleThemeChange = (value: string) => {
    if (value === "custom") {
      form.setValue("theme", customTheme);
    } else {
      form.setValue("theme", value);
      
      // Auto-generate keywords when theme changes
      const platform = form.getValues("platform");
      const contentType = form.getValues("contentType");
      if (value && platform && contentType) {
        handleAutoGenerateKeywords(value, platform, contentType);
      }
    }
  };

  const handleAutoGenerateKeywords = async (theme: string, platform: string, contentType: string) => {
    if (!theme || !platform || !contentType) return;
    
    const keywords = await generateKeywords(theme, platform, contentType);
    if (keywords && keywords.length > 0) {
      form.setValue("seoKeywords", keywords.join(', '), { shouldDirty: true });
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
        name="seoKeywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between">
              <span>Keywords (comma separated)</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const theme = form.getValues("theme");
                  const platform = form.getValues("platform");
                  const contentType = form.getValues("contentType");
                  handleAutoGenerateKeywords(theme, platform, contentType);
                }}
                className="h-6 px-2 text-xs"
                disabled={keywordsLoading}
              >
                {keywordsLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3 mr-1" />
                    Generate
                  </>
                )}
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

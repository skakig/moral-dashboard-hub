
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArticleFormValues } from "../../StepByStepArticleForm";

interface ThemeStepProps {
  form: UseFormReturn<ArticleFormValues>;
  onGenerate?: () => Promise<void>;
  autoGenerate?: boolean;
  setAutoGenerate?: (value: boolean) => void;
  autoGenerateOptions?: {
    content: boolean;
    voice: boolean;
    image: boolean;
  };
  setAutoGenerateOptions?: (options: any) => void;
}

export function ThemeStep({
  form,
  onGenerate,
  autoGenerate = false,
  setAutoGenerate,
  autoGenerateOptions = { content: true, voice: false, image: false },
  setAutoGenerateOptions,
}: ThemeStepProps) {
  const [localTheme, setLocalTheme] = useState(form.getValues("theme") || "");
  
  // Effect to automatically trigger generation when moving to next step if autoGenerate is on
  useEffect(() => {
    // Store autoGenerate settings in form data to pass through the process
    if (setAutoGenerate && setAutoGenerateOptions) {
      form.setValue("_autoGenerate", autoGenerate, { shouldDirty: true });
      form.setValue("_autoGenerateOptions", autoGenerateOptions, { shouldDirty: true });
    }
  }, [autoGenerate, autoGenerateOptions, form, setAutoGenerate, setAutoGenerateOptions]);

  const toggleAutoOption = (option: keyof typeof autoGenerateOptions) => {
    if (setAutoGenerateOptions) {
      setAutoGenerateOptions({
        ...autoGenerateOptions,
        [option]: !autoGenerateOptions[option],
      });
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">What would you like to write about?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Compare the comics Calvin & Hobbes vs The Far Side using TMH Framework Level 9..."
                className="min-h-32"
                {...field}
                value={localTheme}
                onChange={(e) => {
                  setLocalTheme(e.target.value);
                  field.onChange(e);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {setAutoGenerate && setAutoGenerateOptions && (
        <Card className="border-dashed border-muted-foreground/50">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-generate"
                  checked={autoGenerate}
                  onCheckedChange={(checked) => setAutoGenerate(checked as boolean)}
                />
                <Label htmlFor="auto-generate" className="font-semibold">Auto-generate content</Label>
              </div>

              {autoGenerate && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-content"
                      checked={autoGenerateOptions.content}
                      onCheckedChange={() => toggleAutoOption("content")}
                    />
                    <Label htmlFor="auto-content" className="text-sm">Generate article content</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-voice"
                      checked={autoGenerateOptions.voice}
                      onCheckedChange={() => toggleAutoOption("voice")}
                    />
                    <Label htmlFor="auto-voice" className="text-sm">Generate voice content</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-image"
                      checked={autoGenerateOptions.image}
                      onCheckedChange={() => toggleAutoOption("image")}
                    />
                    <Label htmlFor="auto-image" className="text-sm">Generate featured image</Label>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

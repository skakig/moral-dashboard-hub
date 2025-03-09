
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ThemeField } from "../../components/ThemeField";
import { ArticleFormValues } from "../../StepByStepArticleForm";
import { FormField, FormItem, FormLabel, FormDescription, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface ThemeStepProps {
  form: UseFormReturn<ArticleFormValues>;
  onGenerate: () => Promise<void>;
  autoGenerate: boolean;
  setAutoGenerate: (value: boolean) => void;
  autoGenerateOptions?: {
    voice?: boolean;
    image?: boolean;
  };
  setAutoGenerateOptions?: (options: any) => void;
}

export function ThemeStep({ 
  form, 
  onGenerate, 
  autoGenerate, 
  setAutoGenerate,
  autoGenerateOptions = { voice: false, image: false },
  setAutoGenerateOptions = () => {}
}: ThemeStepProps) {
  return (
    <div className="space-y-4">
      <ThemeField form={form} onGenerate={onGenerate} autoGenerate={autoGenerate} />
      
      <div className="space-y-3 pt-2 border-t">
        <FormField
          control={form.control}
          name="autoGenerateContent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Auto-generate content</FormLabel>
                <FormDescription>
                  Automatically generate content when you finish typing
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={autoGenerate}
                  onCheckedChange={setAutoGenerate}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {autoGenerate && (
          <>
            <FormField
              control={form.control}
              name="autoGenerateVoice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Auto-generate voice</FormLabel>
                    <FormDescription>
                      Also generate voice content automatically
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={autoGenerateOptions.voice}
                      onCheckedChange={(checked) => 
                        setAutoGenerateOptions({...autoGenerateOptions, voice: checked})
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoGenerateImage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Auto-generate image</FormLabel>
                    <FormDescription>
                      Also generate featured image automatically
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={autoGenerateOptions.image}
                      onCheckedChange={(checked) => 
                        setAutoGenerateOptions({...autoGenerateOptions, image: checked})
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}

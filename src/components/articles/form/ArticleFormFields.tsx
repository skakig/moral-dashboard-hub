
import React, { useState, useEffect } from "react";
import { BasicInfoFields } from "./components/BasicInfoFields";
import { ContentTypeFields } from "./components/ContentTypeFields";
import { ContentConfigFields } from "./components/ContentConfigFields";
import { ContentField } from "./components/ContentField";
import { MetaDescriptionField } from "./components/MetaDescriptionField";
import { FeaturedImageField } from "./components/FeaturedImageField";
import { useVoiceGeneration } from "./hooks/useVoiceGeneration";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Mic } from "lucide-react";

// Main ArticleFormFields component now acts as a coordinator
export function ArticleFormFields({ form }) {
  const [contentType, setContentType] = useState(form.watch("contentType") || "");
  const [platform, setPlatform] = useState(form.watch("platform") || "");
  const [contentLength, setContentLength] = useState(form.watch("contentLength") || "medium");
  const { generateVoiceContent } = useVoiceGeneration(form);
  const voiceGenerated = form.watch("voiceGenerated") || false;

  // Preserve form values when selections change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "contentType") setContentType(value.contentType);
      if (name === "platform") setPlatform(value.platform);
      if (name === "contentLength") setContentLength(value.contentLength);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="space-y-4">
      <BasicInfoFields form={form} />
      
      <ContentTypeFields 
        form={form} 
        platform={platform} 
        setContentType={setContentType} 
        setPlatform={setPlatform} 
      />
      
      <ContentConfigFields 
        form={form} 
        setContentLength={setContentLength} 
      />
      
      <ContentField form={form} />
      
      {form.watch("content") && (
        <FormField
          control={form.control}
          name="voiceGenerated"
          render={() => (
            <FormItem>
              <FormLabel>Voice Content</FormLabel>
              <div className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generateVoiceContent}
                  className="flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  {voiceGenerated ? "Regenerate Voice" : "Generate Voice Content"}
                </Button>
                {voiceGenerated && (
                  <span className="text-sm text-green-600">Voice content generated!</span>
                )}
              </div>
            </FormItem>
          )}
        />
      )}
      
      <MetaDescriptionField form={form} />
      
      <FeaturedImageField form={form} />
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { BasicInfoFields } from "./components/BasicInfoFields";
import { ContentTypeFields } from "./components/ContentTypeFields";
import { ContentConfigFields } from "./components/ContentConfigFields";
import { ContentField } from "./components/ContentField";
import { MetaDescriptionField } from "./components/MetaDescriptionField";
import { FeaturedImageField } from "./components/FeaturedImageField";

// Main ArticleFormFields component now acts as a coordinator
export function ArticleFormFields({ form }) {
  const [contentType, setContentType] = useState(form.watch("contentType") || "");
  const [platform, setPlatform] = useState(form.watch("platform") || "");
  const [contentLength, setContentLength] = useState(form.watch("contentLength") || "medium");

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
      
      <MetaDescriptionField form={form} />
      
      <FeaturedImageField form={form} />
    </div>
  );
}

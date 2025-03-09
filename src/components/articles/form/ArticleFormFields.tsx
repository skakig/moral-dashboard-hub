
import React, { useState, useEffect } from "react";
import { BasicInfoFields } from "./components/BasicInfoFields";
import { ContentTypeFields } from "./components/ContentTypeFields";
import { ContentConfigFields } from "./components/ContentConfigFields";
import { FeaturedImageField } from "./components/FeaturedImageField";
import { useVoiceGeneration } from "./hooks/useVoiceGeneration";
import { useAIGeneration } from "./hooks/useAIGeneration";
import { toast } from "sonner";

// Import new refactored components
import { CopyButtons } from "./components/CopyButtons";
import { ArticleContentSection } from "./components/ArticleContentSection";
import { VoiceContentSection } from "./components/VoiceContentSection";
import { SEOSection } from "./components/SEOSection";

// Main ArticleFormFields component
export function ArticleFormFields({ form }) {
  const [contentType, setContentType] = useState(form.watch("contentType") || "");
  const [platform, setPlatform] = useState(form.watch("platform") || "");
  const [contentLength, setContentLength] = useState(form.watch("contentLength") || "medium");
  const [moralLevel, setMoralLevel] = useState(form.watch("moralLevel") || 5);
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM"); // Default to Rachel
  const { 
    generateVoiceContent, 
    isGenerating: isGeneratingVoice, 
    audioUrl, 
    isPlaying,
    togglePlayPause,
    downloadAudio,
    setIsPlaying
  } = useVoiceGeneration(form);
  const { loading: isGeneratingContent, generateContent } = useAIGeneration();
  const [error, setError] = useState<string | null>(null);
  const voiceGenerated = form.watch("voiceGenerated") || false;
  const voiceUrl = form.watch("voiceUrl") || "";

  // Preserve form values when selections change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "contentType") setContentType(value.contentType);
      if (name === "platform") setPlatform(value.platform);
      if (name === "contentLength") setContentLength(value.contentLength);
      if (name === "moralLevel") setMoralLevel(value.moralLevel);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleGenerateContent = async () => {
    try {
      setError(null);
      
      // Get the current form values to use as input parameters
      const theme = form.getValues("theme") || ""; 
      const contentType = form.getValues("contentType") || "article";
      const moralLevel = form.getValues("moralLevel") || 5;
      const platform = form.getValues("platform") || "";
      const contentLength = form.getValues("contentLength") || "medium";
      const tone = form.getValues("tone") || "informative";
      const keywords = form.getValues("seoKeywords") ? 
        form.getValues("seoKeywords").split(',').map((k: string) => k.trim()) : 
        [];

      if (!theme) {
        toast.error("Please enter a theme or description of what you want to generate");
        return;
      }

      if (!platform) {
        toast.error("Please select a platform");
        return;
      }

      if (!contentType) {
        toast.error("Please select a content type");
        return;
      }

      console.log("Generating content with params:", { 
        theme, keywords, contentType, moralLevel, platform, contentLength, tone 
      });

      // Call the AI generation
      const content = await generateContent({
        theme,
        keywords,
        contentType,
        moralLevel: parseInt(String(moralLevel), 10),
        platform,
        contentLength,
        tone
      });

      if (content) {
        // Update the form values
        form.setValue("content", content.content, { shouldDirty: true });
        
        // Only update title if it's empty or if the current title is the theme
        if (!form.getValues("title") || form.getValues("title") === theme) {
          form.setValue("title", content.title, { shouldDirty: true });
        }
        
        // Update meta description
        if (content.metaDescription) {
          form.setValue("metaDescription", content.metaDescription, { shouldDirty: true });
        }
        
        // Update keywords if they were generated and not already set
        if (content.keywords && content.keywords.length > 0) {
          form.setValue("seoKeywords", content.keywords.join(', '), { shouldDirty: true });
        }
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
      setError(error.message || "Failed to generate content");
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Function to handle voice generation with the selected voice
  const handleGenerateVoice = async () => {
    await generateVoiceContent(selectedVoice);
  };

  return (
    <div className="space-y-4">
      <BasicInfoFields form={form} />
      
      <CopyButtons 
        form={form} 
        fields={[
          { name: "title", label: "Title" },
          { name: "excerpt", label: "Excerpt" }
        ]} 
      />
      
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
      
      <ArticleContentSection 
        form={form}
        error={error}
        isGeneratingContent={isGeneratingContent}
        handleGenerateContent={handleGenerateContent}
      />
      
      {form.watch("content") && (
        <div className="space-y-4">
          <VoiceContentSection 
            form={form}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            isGeneratingVoice={isGeneratingVoice}
            isPlaying={isPlaying}
            voiceGenerated={voiceGenerated}
            audioUrl={audioUrl}
            handleGenerateVoice={handleGenerateVoice}
            togglePlayPause={togglePlayPause}
            setIsPlaying={setIsPlaying}
            downloadAudio={downloadAudio}
          />
        </div>
      )}
      
      <SEOSection form={form} />
      
      <FeaturedImageField form={form} />
    </div>
  );
}

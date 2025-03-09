
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useAIGeneration } from "../../hooks/useAIGeneration";
import { useImageGeneration } from "../../hooks/useImageGeneration";
import { useVoiceGeneration } from "../../hooks/useVoiceGeneration";
import { ArticleFormValues } from "../types";
import { AutoGenerateOptions } from "./useAutoGenerateOptions";

export function useContentGeneration(
  form: UseFormReturn<ArticleFormValues>,
  autoGenerateOptions: AutoGenerateOptions,
  selectedVoice: string,
  goToStepById: (stepId: string) => void
) {
  const [error, setError] = useState<string | null>(null);
  
  const { loading: isGeneratingContent, generateContent } = useAIGeneration();
  const { generateImage, loading: isGeneratingImage } = useImageGeneration();
  const { 
    generateVoiceContent, 
    isGenerating: isGeneratingVoice, 
    audioUrl, 
    isPlaying,
    togglePlayPause,
    downloadAudio,
    setIsPlaying
  } = useVoiceGeneration(form);

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

      // Call the AI generation
      const content = await generateContent({
        theme,
        keywords,
        contentType,
        moralLevel: typeof moralLevel === 'string' ? parseInt(moralLevel, 10) : moralLevel,
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

        // If auto-generate voice is enabled, generate voice content
        if (autoGenerateOptions.voice) {
          // Move to content step first to ensure content is available
          goToStepById('content');
          
          // Wait a bit for the UI to update before generating voice
          setTimeout(async () => {
            await generateVoiceContent(selectedVoice);
            toast.success("Voice content generated successfully");
          }, 500);
        }
        
        // If auto-generate image is enabled, generate featured image
        if (autoGenerateOptions.image) {
          const imagePrompt = `Create a high-quality featured image for: ${content.title}. Platform: ${platform}, Content type: ${contentType}`;
          
          const imageUrl = await generateImage(imagePrompt);
          if (imageUrl) {
            form.setValue("featuredImage", imageUrl, { shouldDirty: true });
            toast.success("Featured image generated successfully");
          }
        }

        // Move to the content step
        goToStepById('content');
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

  return {
    error,
    setError,
    isGeneratingContent,
    isGeneratingImage,
    isGeneratingVoice,
    isPlaying,
    audioUrl,
    handleGenerateContent,
    handleGenerateVoice,
    togglePlayPause,
    downloadAudio,
    setIsPlaying
  };
}

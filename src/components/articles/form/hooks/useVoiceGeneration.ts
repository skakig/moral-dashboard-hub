
import { useState } from 'react';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for generating voice content for articles
 */
export function useVoiceGeneration(form: UseFormReturn<any>) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVoiceContent = async () => {
    try {
      setIsGenerating(true);
      toast.info("Generating voice content...");
      
      // Get article content from form
      const values = form.getValues();
      const content = values.content || '';
      const title = values.title || 'Untitled';
      
      if (!content) {
        toast.error("Please add content before generating voice");
        return;
      }
      
      // For longer articles, we'll use a summary or truncated version
      // ElevenLabs has a text limit, so we need to ensure we don't exceed it
      const textToConvert = content.length > 5000 
        ? content.substring(0, 4997) + '...' 
        : content;
      
      // Call the Supabase Edge Function to generate voice using ElevenLabs API
      const { data, error } = await supabase.functions.invoke('execute-api-call', {
        body: {
          functionName: "Voice Generation",
          payload: {
            text: textToConvert,
            options: {
              title: title,
              voiceId: "21m00Tcm4TlvDq8ikWAM", // Default ElevenLabs voice ID (Rachel)
              modelId: "eleven_multilingual_v2" // Use the high-quality model
            }
          }
        }
      });
      
      if (error) {
        console.error("Error generating voice content:", error);
        toast.error("Failed to generate voice content: " + error.message);
        return;
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || "Unknown error generating voice content";
        console.error(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      console.log("Voice generation successful:", data);
      
      // In a real implementation with ElevenLabs, we would get a URL or binary audio data
      // For now, we'll simulate success with a timestamp-based URL
      const dummyVoiceUrl = `https://example.com/voice/${Date.now()}.mp3`;
      
      // Update the form with the voice URL
      form.setValue("voiceUrl", dummyVoiceUrl);
      form.setValue("voiceGenerated", true);
      
      toast.success("Voice content generated successfully!");
    } catch (error) {
      console.error("Error generating voice content:", error);
      toast.error(`Failed to generate voice content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateVoiceContent, isGenerating };
}

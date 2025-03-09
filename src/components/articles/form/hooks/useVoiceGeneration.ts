
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for generating voice content for articles
 */
export function useVoiceGeneration(form: UseFormReturn<any>) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
      
      // First, try to use the dedicated voice generation function
      try {
        const { data: voiceData, error: voiceError } = await supabase.functions.invoke('generate-voice', {
          body: {
            text: textToConvert,
            title: title,
            voiceId: "21m00Tcm4TlvDq8ikWAM" // Default ElevenLabs voice ID (Rachel)
          }
        });
        
        if (voiceError) {
          console.error("Error with generate-voice function:", voiceError);
          throw new Error(voiceError.message);
        }
        
        if (!voiceData || !voiceData.success) {
          throw new Error(voiceData?.error || "Failed to generate voice");
        }
        
        // If we get here, we've successfully used the dedicated voice function
        console.log("Voice generation successful with dedicated function:", voiceData);
        
        // Create a playable audio URL from the base64 audio data
        if (voiceData.audioBase64) {
          const audioBlob = base64ToBlob(voiceData.audioBase64, 'audio/mpeg');
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          // Create audio element for playback
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.load();
          } else {
            audioRef.current = new Audio(url);
            audioRef.current.addEventListener('ended', () => {
              setIsPlaying(false);
            });
          }
          
          // Update the form with the voice URL and metadata
          form.setValue("voiceUrl", url);
          form.setValue("voiceGenerated", true);
          form.setValue("voiceFileName", voiceData.fileName || `${title.replace(/\s+/g, '-').toLowerCase()}.mp3`);
          form.setValue("voiceBase64", voiceData.audioBase64); // Store base64 for future use
        }
        
        toast.success("Voice content generated successfully!");
        return;
      } catch (directError) {
        console.warn("Direct voice generation failed, falling back to execute-api-call:", directError);
        // Fall back to the execute-api-call method below
      }
      
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
      
      if (data.audioBase64) {
        // Create a playable audio URL from the base64 audio data
        const audioBlob = base64ToBlob(data.audioBase64, 'audio/mpeg');
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Create audio element for playback
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.load();
        } else {
          audioRef.current = new Audio(url);
          audioRef.current.addEventListener('ended', () => {
            setIsPlaying(false);
          });
        }
        
        // Update the form with the voice URL and metadata
        form.setValue("voiceUrl", url);
        form.setValue("voiceGenerated", true);
        form.setValue("voiceFileName", data.fileName || `${title.replace(/\s+/g, '-').toLowerCase()}.mp3`);
        form.setValue("voiceBase64", data.audioBase64); // Store base64 for future use
      }
      
      toast.success("Voice content generated successfully!");
    } catch (error) {
      console.error("Error generating voice content:", error);
      toast.error(`Failed to generate voice content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Play/pause the audio
  const togglePlayPause = () => {
    if (!audioRef.current) {
      if (audioUrl) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });
      } else {
        return;
      }
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => {
        console.error("Error playing audio:", e);
        toast.error("Failed to play audio");
      });
      setIsPlaying(true);
    }
  };
  
  // Helper function to convert base64 to a Blob
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };
  
  // Function to download the generated audio
  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = form.getValues().voiceFileName || 'voice-content.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Voice download started");
  };

  return { 
    generateVoiceContent, 
    isGenerating, 
    audioUrl,
    isPlaying,
    togglePlayPause,
    downloadAudio
  };
}

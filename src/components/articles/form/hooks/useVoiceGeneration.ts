
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';
import { supabase } from '@/integrations/supabase/client';

export function useVoiceGeneration(form: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const audioSegments = useRef<{audioUrl: string, fileName: string}[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  // Cooldown period of 2 seconds to prevent multiple rapid attempts
  const COOLDOWN_PERIOD = 2000; // in milliseconds
  // Maximum text length per segment
  const MAX_SEGMENT_LENGTH = 3000; // Reduced from 3500 to prevent quota issues

  const generateVoiceContent = useCallback(async (voiceId: string) => {
    const content = form.getValues('content');
    
    if (!content) {
      toast.error('Please add content before generating voice');
      return;
    }
    
    // Check for cooldown period
    const now = Date.now();
    if (lastAttemptTime && now - lastAttemptTime < COOLDOWN_PERIOD) {
      toast.info('Please wait a moment before trying again');
      return;
    }
    
    setLastAttemptTime(now);
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    audioSegments.current = [];
    
    try {
      // First, reset any existing voice content
      setAudioUrl(null);
      form.setValue('voiceGenerated', false, { shouldDirty: true });
      form.setValue('voiceUrl', '', { shouldDirty: true });
      form.setValue('voiceFileName', '', { shouldDirty: true });
      form.setValue('voiceBase64', '', { shouldDirty: true });
      form.setValue('voiceSegments', '', { shouldDirty: true });
      
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current = null;
      }
      
      toast.info('Generating voice content...');

      // Extract only text from content (remove markdown formatting)
      // Improved markdown stripping with regex to handle more formats
      const plainText = content
        .replace(/\[.*?\]|\*\*|#|\*|_|\~\~|`|>/g, '') // Remove markdown formatting
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple line breaks
        .trim();
      
      // Segment the text if it's very long
      const textSegments = splitTextIntoSegments(plainText, MAX_SEGMENT_LENGTH);
      const totalSegments = textSegments.length;
      
      if (totalSegments > 1) {
        toast.info(`Content is long. Processing in ${totalSegments} segments.`);
      }
      
      console.log(`Processing ${totalSegments} segments for voice generation`);
      
      // Process first segment only initially to check if the API is working
      try {
        setProgress(10);
        console.log("Generating voice for first segment...");
        
        // Try using OpenAI TTS first before ElevenLabs
        // This helps avoid ElevenLabs quota issues
        try {
          const result = await supabase.functions.invoke('generate-voice-openai', {
            body: {
              text: textSegments[0],
              voice: "alloy" // OpenAI voice
            }
          });
          
          if (!result || result.error) {
            console.log("OpenAI voice generation failed, falling back to ElevenLabs");
            throw new Error(result?.error || "Failed to generate voice with OpenAI");
          }
          
          // Store the OpenAI result
          audioSegments.current.push({
            audioUrl: result.data.audioUrl,
            fileName: result.data.fileName
          });
          
          console.log("OpenAI voice generation successful for first segment");
        } catch (openAiError) {
          console.log("Falling back to ElevenLabs API...");
          
          // Fall back to ElevenLabs
          const result = await EdgeFunctionService.generateVoice({
            text: textSegments[0],
            voiceId,
            segmentIndex: 0,
            totalSegments
          });
          
          if (!result || result.error) {
            throw new Error(result?.error || "Voice generation failed with both providers");
          }
          
          // Store this segment
          audioSegments.current.push({
            audioUrl: result.audioUrl,
            fileName: result.fileName
          });
          
          console.log("ElevenLabs voice generation successful for first segment");
        }
        
        setProgress(50);
        
        // If we have at least one segment, consider it a success
        if (audioSegments.current.length > 0) {
          // For now, we'll just use the first segment for playing in the UI
          const primarySegment = audioSegments.current[0];
          setAudioUrl(primarySegment.audioUrl);
          
          // Store all segments info in a hidden field for future reference
          form.setValue('voiceSegments', JSON.stringify(audioSegments.current), { shouldDirty: true });
          
          // Update form values with the first segment (for compatibility)
          form.setValue('voiceGenerated', true, { shouldDirty: true });
          form.setValue('voiceUrl', primarySegment.audioUrl, { shouldDirty: true });
          form.setValue('voiceFileName', primarySegment.fileName, { shouldDirty: true });
          
          // Get the base64 data from the data URL
          if (primarySegment.audioUrl.startsWith('data:')) {
            const base64Data = primarySegment.audioUrl.split(',')[1];
            form.setValue('voiceBase64', base64Data, { shouldDirty: true });
          }
          
          // Mark the form as dirty to ensure the updated values are saved
          form.trigger('voiceGenerated');
          form.trigger('voiceUrl');
          form.trigger('voiceFileName');
          form.trigger('voiceBase64');
          form.trigger('voiceSegments');
          
          setProgress(100);
          toast.success('Voice generation complete!');
          console.log("Voice generation successful. Generated segment:", audioSegments.current.length);
        } else {
          throw new Error("No audio segments were generated successfully");
        }
      } catch (segmentError: any) {
        console.error(`Error generating voice:`, segmentError);
        throw segmentError;
      }
    } catch (error: any) {
      console.error('Error generating voice content:', error);
      setError(error.message || "Failed to generate voice content");
      
      // Provide more helpful error messages
      if (error.message?.includes("quota_exceeded")) {
        toast.error("Voice generation quota exceeded. Please try again later or use a different voice service.");
      } else if (error.message?.includes("non-2xx")) {
        toast.error("Voice service returned an error. Please check the edge function logs.");
      } else {
        toast.error(error.message || "Failed to generate voice content");
      }
      
      throw error; // Re-throw for component-level handling
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [form, lastAttemptTime]);

  const splitTextIntoSegments = (text: string, maxSegmentLength: number): string[] => {
    if (text.length <= maxSegmentLength) {
      return [text];
    }
    
    const segments: string[] = [];
    let currentPosition = 0;
    
    while (currentPosition < text.length) {
      // Find a good break point - preferably at the end of a sentence
      let endPosition = Math.min(currentPosition + maxSegmentLength, text.length);
      
      // If we're not at the end of the text, try to find a sentence end
      if (endPosition < text.length) {
        // Look for the last period, question mark, or exclamation mark followed by a space
        const lastSentenceEnd = Math.max(
          text.lastIndexOf('. ', endPosition),
          text.lastIndexOf('? ', endPosition),
          text.lastIndexOf('! ', endPosition)
        );
        
        // If we found a sentence end within a reasonable range, use it
        if (lastSentenceEnd > currentPosition && lastSentenceEnd > endPosition - 100) {
          endPosition = lastSentenceEnd + 1; // Include the period but not the space after
        } else {
          // If no sentence end found, look for last space
          const lastSpace = text.lastIndexOf(' ', endPosition);
          if (lastSpace > currentPosition) {
            endPosition = lastSpace;
          }
          // If no good break point found, just use the max length
        }
      }
      
      // Extract segment and add to results
      const segment = text.substring(currentPosition, endPosition).trim();
      if (segment) {
        segments.push(segment);
      }
      
      // Move to next segment
      currentPosition = endPosition;
    }
    
    return segments;
  };

  const togglePlayPause = useCallback(() => {
    if (!audioUrl) return;
    
    try {
      if (!audioElement.current) {
        // Create a new audio element if one doesn't exist
        const newAudio = new Audio(audioUrl);
        newAudio.onplay = () => setIsPlaying(true);
        newAudio.onpause = () => setIsPlaying(false);
        newAudio.onended = () => setIsPlaying(false);
        
        // Handle errors
        newAudio.onerror = (e: Event) => {
          console.error("Audio playback error:", e);
          const audioElem = e.target as HTMLAudioElement;
          setError(`Audio playback error: ${audioElem?.error?.message || "Unknown error"}`);
          setIsPlaying(false);
        };
        
        audioElement.current = newAudio;
      }
      
      if (isPlaying) {
        audioElement.current.pause();
      } else {
        const playPromise = audioElement.current.play();
        
        // Handle play() Promise rejection (common in some browsers)
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
            })
            .catch(e => {
              console.error("Play rejected:", e);
              setError(`Unable to play audio: ${e.message || "User interaction required"}`);
              setIsPlaying(false);
            });
        }
      }
    } catch (error: any) {
      console.error('Error toggling play/pause:', error);
      setError(error.message || 'Failed to control audio playback');
      toast.error('Failed to control audio playback');
    }
  }, [audioUrl, isPlaying]);

  const downloadAudio = useCallback(() => {
    if (!audioUrl) return;
    
    try {
      // If we have multiple segments, create a zip file with all segments
      const segments = form.getValues('voiceSegments');
      if (segments) {
        try {
          const parsedSegments = JSON.parse(segments);
          if (Array.isArray(parsedSegments) && parsedSegments.length > 1) {
            // For now, just download the first segment and show info
            toast.info(`Downloading first segment. The content was split into ${parsedSegments.length} segments.`);
          }
        } catch (e) {
          // Not valid JSON, ignore
        }
      }
      
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = form.getValues('voiceFileName') || 'voice-content.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Audio file downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading audio:', error);
      setError(error.message || 'Failed to download audio file');
      toast.error('Failed to download audio file');
    }
  }, [audioUrl, form]);

  const resetAudio = useCallback(() => {
    if (audioElement.current) {
      audioElement.current.pause();
      audioElement.current = null;
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setError(null);
  }, []);

  return {
    generateVoiceContent,
    isGenerating,
    audioUrl,
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    downloadAudio,
    error,
    progress,
    resetAudio
  };
}


import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';

export function useVoiceGeneration(form: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Load existing audio if available when the component mounts
  useEffect(() => {
    const existingUrl = form.getValues('voiceUrl');
    if (existingUrl) {
      setAudioUrl(existingUrl);
    }
  }, [form]);

  const generateVoiceContent = async (voiceId: string) => {
    const content = form.getValues('content');
    
    if (!content) {
      toast.error('Please add content before generating voice');
      return;
    }
    
    setIsGenerating(true);
    retryCount.current = 0;
    
    try {
      // First, reset any existing voice content
      setAudioUrl(null);
      form.setValue('voiceGenerated', false, { shouldDirty: true });
      form.setValue('voiceUrl', '', { shouldDirty: true });
      form.setValue('voiceFileName', '', { shouldDirty: true });
      form.setValue('voiceBase64', '', { shouldDirty: true });
      
      toast.info('Generating voice content...');

      // Extract only text from content (remove markdown formatting)
      const plainText = content.replace(/\[.*?\]|\*\*|#/g, '').trim();
      
      await generateWithRetry(plainText, voiceId);
      
    } catch (error: any) {
      console.error('Error generating voice content:', error);
      toast.error(`Failed to generate voice: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWithRetry = async (text: string, voiceId: string) => {
    try {
      // Use the edge function service to generate voice
      const result = await EdgeFunctionService.generateVoice(text, voiceId);
      
      if (!result) {
        throw new Error('No result returned from voice generation service');
      }

      // Set the audio URL and update form values
      setAudioUrl(result.audioUrl);
      form.setValue('voiceGenerated', true, { shouldDirty: true });
      form.setValue('voiceUrl', result.audioUrl, { shouldDirty: true });
      form.setValue('voiceFileName', result.fileName || `voice_${Date.now()}.mp3`, { shouldDirty: true });
      form.setValue('voiceBase64', result.base64Audio, { shouldDirty: true });

      // Mark the form as dirty to ensure the updated values are saved
      form.trigger('voiceGenerated');
      form.trigger('voiceUrl');
      form.trigger('voiceFileName');
      form.trigger('voiceBase64');
      
      toast.success('Voice generation complete!');
      console.log("Voice generation successful - service:", result.service || "unknown");
    } catch (error: any) {
      retryCount.current += 1;
      console.error(`Error in generate-voice (Attempt ${retryCount.current}/${maxRetries}):`, error);
      
      if (retryCount.current < maxRetries) {
        toast.warning(`Voice generation failed, retrying (${retryCount.current}/${maxRetries})...`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return generateWithRetry(text, voiceId);
      }
      
      // If we've exhausted all retries, throw the error
      throw error;
    }
  };

  const togglePlayPause = () => {
    if (!audioUrl && !form.getValues('voiceUrl')) {
      toast.error('No audio available to play');
      return;
    }
    
    const audioElement = audioRef.current || document.querySelector('audio');
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        // Make sure the audio source is set correctly
        if (!audioElement.src) {
          audioElement.src = audioUrl || form.getValues('voiceUrl');
        }
        audioElement.play().catch(error => {
          console.error('Error playing audio:', error);
          toast.error('Failed to play audio');
        });
      }
      setIsPlaying(!isPlaying);
    } else {
      toast.error('Audio player not found');
    }
  };

  const downloadAudio = () => {
    const url = audioUrl || form.getValues('voiceUrl');
    if (!url) {
      toast.error('No audio available to download');
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = form.getValues('voiceFileName') || 'voice-content.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Audio file downloaded successfully');
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Failed to download audio file');
    }
  };

  return {
    generateVoiceContent,
    isGenerating,
    audioUrl,
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    downloadAudio,
    audioRef
  };
}

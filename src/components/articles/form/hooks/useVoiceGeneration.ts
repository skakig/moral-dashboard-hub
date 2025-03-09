
import { useState } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';

export function useVoiceGeneration(form: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);

  // Cooldown period of 2 seconds to prevent multiple rapid attempts
  const COOLDOWN_PERIOD = 2000; // in milliseconds

  const generateVoiceContent = async (voiceId: string) => {
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
      
      // Show a warning if text is very long
      if (plainText.length > 4000) {
        toast.warning('Text is very long. Only the first 4000 characters will be processed.');
      }
      
      // Use the edge function service to generate voice
      const result = await EdgeFunctionService.generateVoice(plainText, voiceId);
      
      if (!result) {
        setError("Voice generation failed. Please try again later.");
        toast.error('Voice generation failed. Please try again later.');
        return;
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
      console.error('Error generating voice content:', error);
      setError(error.message || "Failed to generate voice content");
      // The error is already handled by the service
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioUrl) return;
    
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    try {
      const a = document.createElement('a');
      a.href = audioUrl;
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
    error
  };
}

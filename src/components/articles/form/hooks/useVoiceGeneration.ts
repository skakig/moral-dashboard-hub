
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useVoiceGeneration(form: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const generateVoiceContent = async (voiceId: string) => {
    const content = form.getValues('content');
    
    if (!content) {
      toast.error('Please add content before generating voice');
      return;
    }
    
    setIsGenerating(true);
    let attempt = 1;
    
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
      
      // Try to generate voice with retries
      while (attempt <= MAX_RETRIES + 1) {
        try {
          console.log(`Generating voice attempt ${attempt}/${MAX_RETRIES + 1}`);
          
          // Generate voice content
          const { data, error } = await supabase.functions.invoke('generate-voice', {
            body: { 
              text: plainText, 
              voiceId
            }
          });

          if (error) {
            console.error(`Error generating voice (Attempt ${attempt}/${MAX_RETRIES + 1}):`, error);
            
            if (attempt <= MAX_RETRIES) {
              attempt++;
              toast.warning(`Retrying voice generation (Attempt ${attempt}/${MAX_RETRIES + 1})...`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
              continue;
            }
            
            throw new Error(error.message || 'Failed to generate voice content');
          }

          if (!data || data.error) {
            console.error(`Function returned error (Attempt ${attempt}/${MAX_RETRIES + 1}):`, data?.error);
            
            if (attempt <= MAX_RETRIES) {
              attempt++;
              toast.warning(`Retrying voice generation (Attempt ${attempt}/${MAX_RETRIES + 1})...`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
              continue;
            }
            
            throw new Error(data?.error || 'Invalid response from voice generation function');
          }

          if (!data.audioUrl || !data.base64Audio) {
            throw new Error('No audio data returned from voice generation');
          }

          // Reset retry count on success
          setRetryCount(0);
          
          // Set the audio URL and update form values
          setAudioUrl(data.audioUrl);
          form.setValue('voiceGenerated', true, { shouldDirty: true });
          form.setValue('voiceUrl', data.audioUrl, { shouldDirty: true });
          form.setValue('voiceFileName', data.fileName || `voice_${Date.now()}.mp3`, { shouldDirty: true });
          form.setValue('voiceBase64', data.base64Audio, { shouldDirty: true });

          // Mark the form as dirty to ensure the updated values are saved
          form.trigger('voiceGenerated');
          form.trigger('voiceUrl');
          form.trigger('voiceFileName');
          form.trigger('voiceBase64');
          
          toast.success('Voice generation complete!');
          console.log("Voice generation successful - service:", data.service || "unknown");
          return;
          
        } catch (attemptError) {
          if (attempt > MAX_RETRIES) {
            throw attemptError;
          }
          attempt++;
        }
      }
    } catch (error: any) {
      console.error('Error generating voice content:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('API key')) {
        errorMessage = 'API key error - please check your voice service API key configuration';
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'API rate limit reached - please try again later';
      }
      
      toast.error(`Failed to generate voice: ${errorMessage}`);
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
    downloadAudio
  };
}

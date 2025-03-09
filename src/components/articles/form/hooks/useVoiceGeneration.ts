
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
    try {
      // First, reset any existing voice content
      setAudioUrl(null);
      form.setValue('voiceGenerated', false);
      form.setValue('voiceUrl', '');
      form.setValue('voiceFileName', '');
      form.setValue('voiceBase64', '');
      
      toast.info('Generating voice content...');

      // Extract only text from content (remove markdown formatting)
      const plainText = content.replace(/\[.*?\]|\*\*|#/g, '').trim();
      
      // Generate voice content
      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: { 
          text: plainText, 
          voiceId
        }
      });

      if (error) {
        console.error('Error generating voice:', error);
        
        // If we've retried less than MAX_RETRIES, try again
        if (retryCount < MAX_RETRIES) {
          setRetryCount(retryCount + 1);
          toast.warning(`Retrying voice generation (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          await generateVoiceContent(voiceId);
          return;
        }
        
        throw new Error(error.message || 'Failed to generate voice content');
      }

      if (!data || data.error) {
        console.error('Function returned error:', data?.error);
        
        // If we've retried less than MAX_RETRIES, try again
        if (retryCount < MAX_RETRIES) {
          setRetryCount(retryCount + 1);
          toast.warning(`Retrying voice generation (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          await generateVoiceContent(voiceId);
          return;
        }
        
        throw new Error(data?.error || 'Invalid response from voice generation function');
      }

      // Reset retry count on success
      setRetryCount(0);
      
      // Set the audio URL and update form values
      setAudioUrl(data.audioUrl);
      form.setValue('voiceGenerated', true);
      form.setValue('voiceUrl', data.audioUrl);
      form.setValue('voiceFileName', data.fileName || `voice_${Date.now()}.mp3`);
      form.setValue('voiceBase64', data.base64Audio);

      // Mark the form as dirty to ensure the updated values are saved
      form.trigger('voiceGenerated');
      form.trigger('voiceUrl');
      form.trigger('voiceFileName');
      form.trigger('voiceBase64');
      
      toast.success('Voice generation complete!');
    } catch (error: any) {
      console.error('Error generating voice content:', error);
      toast.error(`Failed to generate voice: ${error.message || 'Unknown error'}`);
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
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = form.getValues('voiceFileName') || 'voice-content.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

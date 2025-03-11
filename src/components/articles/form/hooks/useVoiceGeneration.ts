
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';

export function useVoiceGeneration(form: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Initialize audio element on mount
  useEffect(() => {
    return () => {
      // Cleanup audio on unmount
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const generateVoiceContent = async (voiceId: string) => {
    const content = form.getValues('content');
    
    if (!content) {
      toast.error('Please add content before generating voice');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Reset any existing voice content
      setAudioUrl(null);
      form.setValue('voiceGenerated', false);
      form.setValue('voiceUrl', '');
      form.setValue('voiceFileName', '');
      form.setValue('voiceBase64', '');
      
      toast.info('Generating voice content...');
      
      // Call the edge function to generate voice
      const result = await EdgeFunctionService.generateVoice(content, voiceId);
      
      if (!result) {
        toast.error('Failed to generate voice content.');
        return;
      }

      // Set the audio URL and update form values
      setAudioUrl(result.audioUrl);
      form.setValue('voiceGenerated', true);
      form.setValue('voiceUrl', result.audioUrl);
      form.setValue('voiceFileName', result.fileName || `voice_${Date.now()}.mp3`);
      form.setValue('voiceBase64', result.base64Audio);

      // Mark the form as dirty to ensure the updated values are saved
      form.trigger('voiceGenerated');
      form.trigger('voiceUrl');
      form.trigger('voiceFileName');
      form.trigger('voiceBase64');
      
      toast.success('Voice generation complete!');
      console.log("Voice generation successful");
    } catch (error: any) {
      console.error('Error generating voice content:', error);
      toast.error(error.message || 'Failed to generate voice content.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    const url = audioUrl || form.getValues('voiceUrl');
    
    if (!url) {
      toast.error('No audio available to play');
      return;
    }
    
    try {
      // Get or create an audio element
      let audio = audioElement;
      
      if (!audio) {
        audio = new Audio(url);
        setAudioElement(audio);
        
        // Add event listeners
        audio.addEventListener('ended', () => setIsPlaying(false));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('play', () => setIsPlaying(true));
      }
      
      if (isPlaying) {
        audio.pause();
      } else {
        // Set the source again in case it changed
        if (audio.src !== url) {
          audio.src = url;
        }
        
        audio.play().catch(error => {
          console.error('Audio playback error:', error);
          toast.error('Error playing audio');
        });
      }
    } catch (error) {
      console.error('Audio control error:', error);
      toast.error('Failed to control audio playback');
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
    downloadAudio
  };
}

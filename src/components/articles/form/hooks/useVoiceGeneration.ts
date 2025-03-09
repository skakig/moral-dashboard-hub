
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';

export function useVoiceGeneration(form: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const audioSegments = useRef<{audioUrl: string, fileName: string}[]>([]);
  const combinedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cooldown period of 2 seconds to prevent multiple rapid attempts
  const COOLDOWN_PERIOD = 2000; // in milliseconds
  // Maximum text length per segment
  const MAX_SEGMENT_LENGTH = 3500;

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
    setProgress(0);
    audioSegments.current = [];
    
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
      
      // Segment the text if it's very long
      const textSegments = splitTextIntoSegments(plainText, MAX_SEGMENT_LENGTH);
      const totalSegments = textSegments.length;
      
      if (totalSegments > 1) {
        toast.info(`Content is long. Processing in ${totalSegments} segments.`);
      }
      
      // Process each segment sequentially
      for (let i = 0; i < totalSegments; i++) {
        setProgress(Math.floor((i / totalSegments) * 50)); // First half of progress for processing
        
        // Generate voice for this segment
        const result = await EdgeFunctionService.generateVoice({
          text: textSegments[i],
          voiceId,
          segmentIndex: i,
          totalSegments
        });
        
        if (!result || result.error) {
          throw new Error(result?.error || "Voice generation failed");
        }
        
        // Store this segment
        audioSegments.current.push({
          audioUrl: result.audioUrl,
          fileName: result.fileName
        });
        
        setProgress(50 + Math.floor((i / totalSegments) * 50)); // Second half is for combining
      }
      
      // If we have multiple segments, we'll need to handle them differently
      if (totalSegments > 1) {
        toast.info('Combining audio segments...');
        
        // For now, we'll just use the first segment for playing in the UI
        // In a production app, you might want to concatenate the audio files server-side
        const primarySegment = audioSegments.current[0];
        setAudioUrl(primarySegment.audioUrl);
        
        // Store all segments info in a hidden field for future reference
        form.setValue('voiceSegments', JSON.stringify(audioSegments.current), { shouldDirty: true });
      } else if (totalSegments === 1) {
        // Single segment, simple case
        setAudioUrl(audioSegments.current[0].audioUrl);
      }
      
      // Update form values with the first segment (for compatibility)
      form.setValue('voiceGenerated', true, { shouldDirty: true });
      form.setValue('voiceUrl', audioSegments.current[0].audioUrl, { shouldDirty: true });
      form.setValue('voiceFileName', audioSegments.current[0].fileName, { shouldDirty: true });
      
      // Mark the form as dirty to ensure the updated values are saved
      form.trigger('voiceGenerated');
      form.trigger('voiceUrl');
      form.trigger('voiceFileName');
      form.trigger('voiceSegments');
      
      setProgress(100);
      toast.success('Voice generation complete!');
      console.log("Voice generation successful. Total segments:", totalSegments);
    } catch (error: any) {
      console.error('Error generating voice content:', error);
      setError(error.message || "Failed to generate voice content");
      toast.error(`Voice generation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

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

  const togglePlayPause = () => {
    if (!audioUrl) return;
    
    try {
      if (combinedAudioRef.current) {
        if (isPlaying) {
          combinedAudioRef.current.pause();
        } else {
          combinedAudioRef.current.play();
        }
        return;
      }
      
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        if (isPlaying) {
          audioElement.pause();
        } else {
          audioElement.play();
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      toast.error('Failed to control audio playback');
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    try {
      // If we have multiple segments
      const segments = form.getValues('voiceSegments');
      if (segments) {
        try {
          const parsedSegments = JSON.parse(segments);
          if (Array.isArray(parsedSegments) && parsedSegments.length > 1) {
            // Create a zip file of all segments would be ideal
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
    error,
    progress
  };
}

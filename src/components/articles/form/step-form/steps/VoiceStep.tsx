
import React, { useEffect } from 'react';
import { FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Play, Pause, Volume2, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface VoiceStepProps {
  form: UseFormReturn<any>;
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
  isGenerating: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  onGenerate: () => void;
  togglePlayPause: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  downloadAudio: () => void;
}

export function VoiceStep({
  form,
  selectedVoice,
  setSelectedVoice,
  isGenerating,
  isPlaying,
  audioUrl,
  onGenerate,
  togglePlayPause,
  setIsPlaying,
  downloadAudio,
}: VoiceStepProps) {
  const voiceGenerated = form.watch('voiceGenerated') || false;
  const formVoiceUrl = form.watch('voiceUrl') || '';
  
  // Get the current audio URL (either from state or form)
  const currentAudioUrl = audioUrl || formVoiceUrl;

  // Add event listeners when audio element is available
  useEffect(() => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      const handleEnded = () => setIsPlaying(false);
      const handlePause = () => setIsPlaying(false);
      const handlePlay = () => setIsPlaying(true);
      
      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('play', handlePlay);
      
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('play', handlePlay);
      };
    }
  }, [setIsPlaying]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormLabel>Voice Selection</FormLabel>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="21m00Tcm4TlvDq8ikWAM">Rachel (Female)</SelectItem>
              <SelectItem value="AZnzlk1XvdvUeBnXmlld">Domi (Female)</SelectItem>
              <SelectItem value="EXAVITQu4vr4xnSDxMaL">Bella (Female)</SelectItem>
              <SelectItem value="ErXwobaYiN019PkySvjV">Antoni (Male)</SelectItem>
              <SelectItem value="MF3mGyEYCl7XYWbV9V6O">Elli (Female)</SelectItem>
              <SelectItem value="TxGEqnHWrfWFTfGW9XjX">Josh (Male)</SelectItem>
              <SelectItem value="VR6AewLTigWG4xSOukaG">Arnold (Male)</SelectItem>
              <SelectItem value="pNInz6obpgDQGcFmaJgB">Adam (Male)</SelectItem>
              <SelectItem value="yoZ06aMxZJJ28mfd3POQ">Sam (Male)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onGenerate}
            disabled={isGenerating || !form.getValues('content')}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Voice
              </>
            )}
          </Button>

          {voiceGenerated && !isGenerating && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-10 p-0"
                onClick={togglePlayPause}
                disabled={!currentAudioUrl}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-10 p-0"
                onClick={downloadAudio}
                disabled={!currentAudioUrl}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {currentAudioUrl && (
        <div className="p-4 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isPlaying ? 'Playing audio...' : 'Audio ready to play'}
            </p>
          </div>
          <audio
            src={currentAudioUrl}
            className="w-full mt-2"
            controls
          />
        </div>
      )}
    </div>
  );
}


import React from "react";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Wand2,
  Play,
  Pause,
  Volume2,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface VoiceContentSectionProps {
  form: UseFormReturn<any>;
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
  isGeneratingVoice: boolean;
  isPlaying: boolean;
  voiceGenerated: boolean;
  audioUrl: string | null;
  handleGenerateVoice: () => void;
  togglePlayPause: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  downloadAudio: () => void;
}

export function VoiceContentSection({
  form,
  selectedVoice,
  setSelectedVoice,
  isGeneratingVoice,
  isPlaying,
  voiceGenerated,
  audioUrl,
  handleGenerateVoice,
  togglePlayPause,
  setIsPlaying,
  downloadAudio,
}: VoiceContentSectionProps) {
  // Handle audio element events
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Get the current audio URL (either from state or form)
  const currentAudioUrl = audioUrl || form.watch("voiceUrl");
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Voice Content</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Generate audio version of your content with ElevenLabs voice synthesis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <FormLabel>Voice Selection</FormLabel>
          <Select
            value={selectedVoice}
            onValueChange={setSelectedVoice}
          >
            <SelectTrigger>
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
            className="min-w-24"
            onClick={handleGenerateVoice}
            disabled={isGeneratingVoice || !form.getValues("content")}
          >
            {isGeneratingVoice ? (
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
          
          {voiceGenerated && !isGeneratingVoice && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-12"
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
                className="w-12"
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
        <div className="mt-4 p-4 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isPlaying ? "Playing audio..." : "Audio ready to play"}
            </p>
          </div>
          <audio
            src={currentAudioUrl}
            onEnded={handleAudioEnded}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            className="w-full mt-2"
            controls
          />
        </div>
      )}
    </div>
  );
}

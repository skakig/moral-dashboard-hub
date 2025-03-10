
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Play, Pause, Download, Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArticleFormValues } from "../../StepByStepArticleForm";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

// Voice options with IDs from ElevenLabs
const voiceOptions = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Default)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Adam" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Nicole" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Sam" },
];

interface VoiceStepProps {
  form: UseFormReturn<ArticleFormValues>;
  selectedVoice: string;
  setSelectedVoice: (value: string) => void;
  isGenerating: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  onGenerate: () => Promise<void>;
  togglePlayPause: () => void;
  setIsPlaying: (value: boolean) => void;
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
  downloadAudio
}: VoiceStepProps) {
  const [volume, setVolume] = React.useState(1);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Load existing voice content if available when component mounts
  useEffect(() => {
    const voiceUrl = form.watch("voiceUrl");
    if (voiceUrl && audioRef.current) {
      audioRef.current.src = voiceUrl;
    }
  }, [form]);

  // Update volume when slider changes
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Directly handle audio events
  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio playback error:", e);
    toast.error("Error playing audio file");
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      {form.watch("content") ? (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <FormLabel className="min-w-24">Voice Style:</FormLabel>
            <Select 
              value={selectedVoice} 
              onValueChange={setSelectedVoice}
            >
              <FormControl>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select voice style" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {voiceOptions.map(voice => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {form.watch("voiceGenerated") ? "Regenerate Voice" : "Generate Voice Content"}
            </Button>
            
            {form.watch("voiceGenerated") && (
              <>
                <span className="text-sm text-green-600">Voice content generated!</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={togglePlayPause}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={downloadAudio}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </>
            )}
          </div>
          
          {form.watch("voiceGenerated") && (form.watch("voiceUrl") || audioUrl) && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[volume]} 
                    min={0} 
                    max={1} 
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-32" 
                  />
                </div>
                
                <audio 
                  ref={audioRef}
                  controls 
                  src={audioUrl || form.watch("voiceUrl")} 
                  className="w-full" 
                  onPlay={handleAudioPlay}
                  onPause={handleAudioPause}
                  onEnded={handleAudioEnded}
                  onError={handleAudioError}
                />
              </div>
              
              <div className="text-xs text-muted-foreground mt-3">
                {form.watch("voiceFileName") || "voice-file.mp3"}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground">
          Please add content before generating voice.
        </div>
      )}
    </div>
  );
}

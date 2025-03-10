
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Download, Play, Pause } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

// Voice options with IDs from ElevenLabs
export const voiceOptions = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Default)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Adam" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Nicole" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Sam" },
];

interface VoiceContentSectionProps {
  form: UseFormReturn<any>;
  selectedVoice: string;
  setSelectedVoice: (value: string) => void;
  isGeneratingVoice: boolean;
  isPlaying: boolean;
  voiceGenerated: boolean;
  audioUrl: string | null;
  handleGenerateVoice: () => Promise<void>;
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
  downloadAudio
}: VoiceContentSectionProps) {
  return (
    <FormField
      control={form.control}
      name="voiceGenerated"
      render={() => (
        <FormItem>
          <FormLabel>Voice Content</FormLabel>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <FormLabel className="min-w-24">Voice Style:</FormLabel>
              <Select 
                defaultValue={selectedVoice} 
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
                onClick={handleGenerateVoice}
                disabled={isGeneratingVoice}
                className="flex items-center gap-2"
              >
                {isGeneratingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                {voiceGenerated ? "Regenerate Voice" : "Generate Voice Content"}
              </Button>
              
              {voiceGenerated && (
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
            
            {voiceGenerated && audioUrl && (
              <div className="mt-2 p-2 border rounded bg-muted/50">
                <audio 
                  controls 
                  src={audioUrl} 
                  className="w-full" 
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}

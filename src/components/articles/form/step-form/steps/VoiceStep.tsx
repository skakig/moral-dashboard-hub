
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Play, Pause, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArticleFormValues } from "../../StepByStepArticleForm";
import { Card, CardContent } from "@/components/ui/card";

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
  onNext?: () => void;
  onBack?: () => void;
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
  onNext,
  onBack
}: VoiceStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-6">
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
        
        {form.watch("content") ? (
          <div className="flex flex-col space-y-4">
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
            
            {form.watch("voiceGenerated") && audioUrl && (
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

            <Card className="bg-muted/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Voice content allows your audience to listen to your article, increasing engagement and accessibility. 
                  Choose a voice that matches your content's tone for the best experience.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-muted-foreground p-4 border border-dashed rounded-md text-center">
            Please add content in the previous step before generating voice.
          </div>
        )}
      </div>

      {/* 
        NOTE: We're removing the navigation buttons here since they will
        be handled by the StepControls component in ArticleFormLayout
      */}
    </div>
  );
}

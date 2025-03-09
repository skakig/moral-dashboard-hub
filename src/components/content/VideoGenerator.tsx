
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2 } from "lucide-react";
import { VideosList } from "./VideosList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function VideoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [duration, setDuration] = useState("30");
  const [voiceStyle, setVoiceStyle] = useState("casual");
  
  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt for your video");
      return;
    }
    
    setIsGenerating(true);
    toast.info("Video generation started. This might take a few minutes...");
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Video generated successfully!");
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Generate New Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={platform}
              onValueChange={setPlatform}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram Reels</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prompt">Video Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the video you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Select
                value={duration}
                onValueChange={setDuration}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds (Short)</SelectItem>
                  <SelectItem value="30">30 seconds (Medium)</SelectItem>
                  <SelectItem value="60">60 seconds (Long)</SelectItem>
                  <SelectItem value="120">2 minutes (Extended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voiceStyle">Voice Style</Label>
              <Select
                value={voiceStyle}
                onValueChange={setVoiceStyle}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-4">
            <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Video preview will appear here</p>
              {/* Video preview will go here */}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setPrompt("");
              setDuration("30");
              setVoiceStyle("casual");
            }}
          >
            Reset
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Saved Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <VideosList />
        </CardContent>
      </Card>
    </div>
  );
}

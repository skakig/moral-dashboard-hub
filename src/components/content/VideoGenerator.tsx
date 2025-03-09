
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Wand2, Loader2 } from "lucide-react";
import { VideosList } from "./VideosList";

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(15);
  const [style, setStyle] = useState("realistic");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    
    // Simulate API call to generate video
    setTimeout(() => {
      setIsGenerating(false);
      // Video generation success would happen here
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Generate AI Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Video Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the video you want to generate in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="style">Visual Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="3d">3D Animation</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Duration: {duration} seconds</Label>
              <Slider
                defaultValue={[15]}
                min={5}
                max={60}
                step={5}
                onValueChange={(values) => setDuration(values[0])}
              />
            </div>
          </div>
          
          <div className="pt-4">
            <div className="bg-muted/30 rounded-lg h-[240px] flex items-center justify-center">
              <p className="text-muted-foreground">Video preview will appear here</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setPrompt("")}>
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
          <CardTitle>Your Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <VideosList />
        </CardContent>
      </Card>
    </div>
  );
}

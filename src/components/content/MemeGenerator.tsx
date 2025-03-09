
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, RefreshCw, Download, Loader2 } from "lucide-react";
import { MemePreview } from "./MemePreview";
import { MemesList } from "./MemesList";

export function MemeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    
    // Simulate API call to generate meme
    setTimeout(() => {
      setGeneratedImage("https://via.placeholder.com/600x500/1f2937/ffffff?text=AI+Generated+Meme");
      setIsGenerating(false);
    }, 1500);
  };
  
  const handleSave = () => {
    // Save meme logic would go here
    console.log("Saving meme:", { prompt, topText, bottomText, image: generatedImage });
  };
  
  const handleDownload = () => {
    // Download meme logic would go here
    console.log("Downloading meme");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Generate New Meme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Image Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the meme image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topText">Top Text</Label>
              <Input
                id="topText"
                placeholder="Top text for your meme"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bottomText">Bottom Text</Label>
              <Input
                id="bottomText"
                placeholder="Bottom text for your meme"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
              />
            </div>
          </div>
          
          <div className="pt-4 flex flex-col items-center">
            {generatedImage ? (
              <MemePreview 
                imageUrl={generatedImage} 
                topText={topText} 
                bottomText={bottomText} 
              />
            ) : (
              <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Your meme will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => {
                setPrompt("");
                setTopText("");
                setBottomText("");
                setGeneratedImage(null);
              }}
            >
              Reset
            </Button>
          </div>
          <div className="space-x-2">
            {generatedImage && (
              <>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => handleGenerate()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button onClick={handleSave}>Save Meme</Button>
              </>
            )}
            {!generatedImage && (
              <Button onClick={handleGenerate} disabled={isGenerating || !prompt}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Meme
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Saved Memes</CardTitle>
        </CardHeader>
        <CardContent>
          <MemesList />
        </CardContent>
      </Card>
    </div>
  );
}

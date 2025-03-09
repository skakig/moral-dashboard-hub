import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, RefreshCw, Download, Share2, Loader2, Save } from "lucide-react";
import { MemePreview } from "./MemePreview";
import { MemesList } from "./MemesList";
import { useMemeOperations } from "@/hooks/useMemeOperations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemeFormData } from "@/types/meme";
import { toast } from "sonner";

export function MemeGenerator() {
  const [formData, setFormData] = useState<MemeFormData>({
    prompt: "",
    topText: "",
    bottomText: "",
    platform: "twitter"
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const { 
    isGenerating, 
    isSaving,
    savedMemes,
    isLoading,
    generateMemeImage, 
    saveMeme,
    fetchMemes,
    deleteMeme,
    downloadMeme,
    shareMeme
  } = useMemeOperations();

  useEffect(() => {
    fetchMemes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (value: string) => {
    setFormData((prev) => ({ ...prev, platform: value }));
  };

  const handleGenerate = async () => {
    if (!formData.prompt) {
      toast.error("Please enter a prompt for your meme");
      return;
    }
    
    const image = await generateMemeImage(formData.prompt, formData.platform);
    
    if (image) {
      setFormData((prev) => ({ ...prev, imageUrl: image }));
    }
  };
  
  const handleSave = async () => {
    if (editMode && editId) {
      // TODO: Add edit functionality when API is ready
      toast.success("Meme updated successfully");
      setEditMode(false);
      setEditId(null);
    } else {
      await saveMeme(formData);
    }
  };
  
  const handleDownload = () => {
    if (formData.imageUrl) {
      downloadMeme(formData.imageUrl, formData.topText, formData.bottomText);
    }
  };

  const handleShare = () => {
    if (!formData.imageUrl) {
      toast.error("Generate a meme first before sharing");
      return;
    }
    
    if (!formData.platform) {
      toast.error("Please select a platform for sharing");
      return;
    }
    
    // Build share text from the meme text
    const shareText = `${formData.topText} ${formData.bottomText}`.trim();
    
    shareMeme(
      formData.platform, 
      formData.imageUrl, 
      shareText, 
      {
        redirectUrl: "https://themh.io",
        tags: ["TheMoralHierarchy", "TMH", formData.platform]
      }
    );
  };

  const handleReset = () => {
    setFormData({
      prompt: "",
      topText: "",
      bottomText: "",
      platform: formData.platform, // Keep the selected platform
      imageUrl: undefined
    });
    setEditMode(false);
    setEditId(null);
  };
  
  const handleEditMeme = (meme: any) => {
    setFormData({
      prompt: meme.prompt,
      topText: meme.topText,
      bottomText: meme.bottomText,
      imageUrl: meme.imageUrl,
      platform: meme.platform || "twitter"
    });
    setEditMode(true);
    setEditId(meme.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{editMode ? "Edit Meme" : "Generate New Meme"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={formData.platform}
              onValueChange={handlePlatformChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="pinterest">Pinterest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prompt">Image Prompt</Label>
            <Textarea
              id="prompt"
              name="prompt"
              placeholder="Describe the meme image you want to generate..."
              value={formData.prompt}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topText">Top Text</Label>
              <Input
                id="topText"
                name="topText"
                placeholder="Top text for your meme"
                value={formData.topText}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bottomText">Bottom Text</Label>
              <Input
                id="bottomText"
                name="bottomText"
                placeholder="Bottom text for your meme"
                value={formData.bottomText}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="pt-4 flex flex-col items-center">
            {formData.imageUrl ? (
              <MemePreview 
                imageUrl={formData.imageUrl} 
                topText={formData.topText} 
                bottomText={formData.bottomText} 
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
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
          <div className="space-x-2">
            {formData.imageUrl && (
              <>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" onClick={handleGenerate} disabled={isGenerating || !formData.prompt}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !formData.imageUrl}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editMode ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editMode ? "Update Meme" : "Save Meme"}
                    </>
                  )}
                </Button>
              </>
            )}
            {!formData.imageUrl && (
              <Button onClick={handleGenerate} disabled={isGenerating || !formData.prompt}>
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
          <MemesList 
            memes={savedMemes} 
            isLoading={isLoading} 
            onEdit={handleEditMeme} 
            onDelete={deleteMeme} 
            onShare={shareMeme}
          />
        </CardContent>
      </Card>
    </div>
  );
}

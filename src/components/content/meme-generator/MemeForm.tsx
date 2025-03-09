
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, RefreshCw, Download, Share2, Loader2, Save } from "lucide-react";
import { MemePreview } from "../MemePreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemeFormData } from "@/types/meme";
import { toast } from "sonner";

interface MemeFormProps {
  formData: MemeFormData;
  isGenerating: boolean;
  isSaving: boolean;
  editMode: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handlePlatformChange: (value: string) => void;
  handleGenerate: () => void;
  handleSave: () => void;
  handleDownload: () => void;
  handleShare: () => void;
  handleReset: () => void;
}

export function MemeForm({
  formData,
  isGenerating,
  isSaving,
  editMode,
  handleInputChange,
  handlePlatformChange,
  handleGenerate,
  handleSave,
  handleDownload,
  handleShare,
  handleReset
}: MemeFormProps) {
  return (
    <div className="space-y-4">
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
      
      <div className="flex justify-between pt-4">
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
      </div>
    </div>
  );
}

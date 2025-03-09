
import React, { useState } from "react";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useContentThemes } from "@/hooks/useContentThemes";

interface AIGenerationDialogProps {
  onGenerate: (params: any) => Promise<void>;
  onCancel: () => void;
}

export function AIGenerationDialog({ onGenerate, onCancel }: AIGenerationDialogProps) {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number>(5);
  const [contentType, setContentType] = useState("article");
  const [contentLength, setContentLength] = useState("medium");
  const { themes, isLoading: themesLoading } = useContentThemes();

  const handleGenerateAI = async () => {
    if (!selectedTheme) {
      toast.error("Please select a content theme");
      return;
    }

    try {
      setAiGenerating(true);
      const theme = themes?.find(t => t.id === selectedTheme);
      
      if (!theme) {
        toast.error("Selected theme not found");
        return;
      }

      await onGenerate({
        theme: theme.name,
        keywords: theme.keywords || [],
        contentType,
        moralLevel: selectedLevel,
        contentLength
      });
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setAiGenerating(false);
    }
  };

  // Helper function to show content type specific options
  const showContentLengthOptions = () => {
    if (contentType === "social_media" || contentType.includes("youtube")) {
      return (
        <div className="space-y-2">
          <label htmlFor="platform">Platform</label>
          <Select 
            onValueChange={(value) => setContentType(`${contentType.split('_')[0]}_${value}`)}
            value={contentType.includes("_") ? contentType.split("_")[1] : ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              {contentType.includes("youtube") && (
                <>
                  <SelectItem value="shorts">YouTube Shorts</SelectItem>
                  <SelectItem value="long">YouTube Long-Form</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Generate Content with AI</DialogTitle>
        <DialogDescription>
          Select a theme, type, and length to generate content
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="theme">Content Theme</label>
          <Select 
            onValueChange={setSelectedTheme} 
            value={selectedTheme}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              {!themesLoading && themes?.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="content-type">Content Type</label>
          <Select 
            onValueChange={(value) => setContentType(value)} 
            value={contentType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="blog_post">Blog Post</SelectItem>
              <SelectItem value="guide">Guide</SelectItem>
              <SelectItem value="social_media">Social Media Script</SelectItem>
              <SelectItem value="youtube">YouTube Script</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showContentLengthOptions()}

        <div className="space-y-2">
          <label htmlFor="content-length">Content Length</label>
          <Select 
            onValueChange={setContentLength} 
            value={contentLength}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (300-500 words)</SelectItem>
              <SelectItem value="medium">Medium (1000-1500 words)</SelectItem>
              <SelectItem value="long">Long (2000-3000 words)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="moral-level">Moral Level (1-9)</label>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedLevel(Math.max(1, selectedLevel - 1))}
              disabled={selectedLevel <= 1}
            >
              -
            </Button>
            <span className="font-medium text-center w-8">{selectedLevel}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedLevel(Math.min(9, selectedLevel + 1))}
              disabled={selectedLevel >= 9}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleGenerateAI} 
          disabled={aiGenerating || !selectedTheme}
        >
          {aiGenerating && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {aiGenerating ? "Generating..." : "Generate"}
        </Button>
      </DialogFooter>
    </>
  );
}

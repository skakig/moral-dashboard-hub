
import React, { useState, useEffect } from "react";
import { BasicInfoFields } from "./components/BasicInfoFields";
import { ContentTypeFields } from "./components/ContentTypeFields";
import { ContentConfigFields } from "./components/ContentConfigFields";
import { ContentField } from "./components/ContentField";
import { MetaDescriptionField } from "./components/MetaDescriptionField";
import { FeaturedImageField } from "./components/FeaturedImageField";
import { ThemeField } from "./components/ThemeField";
import { useVoiceGeneration } from "./hooks/useVoiceGeneration";
import { useAIGeneration } from "./hooks/useAIGeneration";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Mic, Loader2, Download, Play, Pause, Copy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

// Main ArticleFormFields component
export function ArticleFormFields({ form }) {
  const [contentType, setContentType] = useState(form.watch("contentType") || "");
  const [platform, setPlatform] = useState(form.watch("platform") || "");
  const [contentLength, setContentLength] = useState(form.watch("contentLength") || "medium");
  const [moralLevel, setMoralLevel] = useState(form.watch("moralLevel") || 5);
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM"); // Default to Rachel
  const { 
    generateVoiceContent, 
    isGenerating: isGeneratingVoice, 
    audioUrl, 
    isPlaying,
    togglePlayPause,
    downloadAudio,
    setIsPlaying
  } = useVoiceGeneration(form);
  const { loading: isGeneratingContent, generateContent } = useAIGeneration();
  const [error, setError] = useState<string | null>(null);
  const voiceGenerated = form.watch("voiceGenerated") || false;
  const voiceUrl = form.watch("voiceUrl") || "";

  // Preserve form values when selections change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "contentType") setContentType(value.contentType);
      if (name === "platform") setPlatform(value.platform);
      if (name === "contentLength") setContentLength(value.contentLength);
      if (name === "moralLevel") setMoralLevel(value.moralLevel);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleGenerateContent = async () => {
    try {
      setError(null);
      
      // Get the current form values to use as input parameters
      const theme = form.getValues("theme") || ""; 
      const contentType = form.getValues("contentType") || "article";
      const moralLevel = form.getValues("moralLevel") || 5;
      const platform = form.getValues("platform") || "";
      const contentLength = form.getValues("contentLength") || "medium";
      const tone = form.getValues("tone") || "informative";
      const keywords = form.getValues("seoKeywords") ? 
        form.getValues("seoKeywords").split(',').map((k: string) => k.trim()) : 
        [];

      if (!theme) {
        toast.error("Please enter a theme or description of what you want to generate");
        return;
      }

      if (!platform) {
        toast.error("Please select a platform");
        return;
      }

      if (!contentType) {
        toast.error("Please select a content type");
        return;
      }

      console.log("Generating content with params:", { 
        theme, keywords, contentType, moralLevel, platform, contentLength, tone 
      });

      // Call the AI generation
      const content = await generateContent({
        theme,
        keywords,
        contentType,
        moralLevel: parseInt(String(moralLevel), 10),
        platform,
        contentLength,
        tone
      });

      if (content) {
        // Update the form values
        form.setValue("content", content.content, { shouldDirty: true });
        
        // Only update title if it's empty or if the current title is the theme
        if (!form.getValues("title") || form.getValues("title") === theme) {
          form.setValue("title", content.title, { shouldDirty: true });
        }
        
        // Update meta description
        if (content.metaDescription) {
          form.setValue("metaDescription", content.metaDescription, { shouldDirty: true });
        }
        
        // Update keywords if they were generated and not already set
        if (content.keywords && content.keywords.length > 0) {
          form.setValue("seoKeywords", content.keywords.join(', '), { shouldDirty: true });
        }
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
      setError(error.message || "Failed to generate content");
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Function to handle voice generation with the selected voice
  const handleGenerateVoice = async () => {
    await generateVoiceContent(selectedVoice);
  };
  
  // Copy function for each field
  const handleCopyField = (fieldName: string, successMessage: string) => {
    const value = form.getValues(fieldName);
    if (value) {
      navigator.clipboard.writeText(String(value));
      toast.success(successMessage);
    } else {
      toast.error(`No ${fieldName} to copy`);
    }
  };

  return (
    <div className="space-y-4">
      <BasicInfoFields form={form} />
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => handleCopyField('title', 'Title copied to clipboard')}
          className="flex items-center gap-1"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Title
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => handleCopyField('excerpt', 'Excerpt copied to clipboard')}
          className="flex items-center gap-1"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Excerpt
        </Button>
      </div>
      
      <ContentTypeFields 
        form={form} 
        platform={platform} 
        setContentType={setContentType} 
        setPlatform={setPlatform} 
      />
      
      <ContentConfigFields 
        form={form} 
        setContentLength={setContentLength} 
      />
      
      <div>
        <h3 className="text-lg font-medium mb-2">Article Content</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your article content below or use AI to generate content based on your settings.
          The content should align with The Moral Hierarchy principles at level {form.watch("moralLevel") || "5"}.
        </p>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <Separator className="mb-4" />
        
        {/* Add the ThemeField component before ContentField with the generate handler */}
        <div className="mb-4">
          <ThemeField form={form} onGenerate={handleGenerateContent} />
        </div>
        
        <ContentField form={form} isGenerating={isGeneratingContent} onGenerate={handleGenerateContent} />
      </div>
      
      {form.watch("content") && (
        <div className="space-y-4">
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
        </div>
      )}
      
      <div className="space-y-4">
        <MetaDescriptionField form={form} />
        
        <FormField
          control={form.control}
          name="seoKeywords"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Keywords (comma separated)</FormLabel>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs flex items-center gap-1"
                  onClick={() => handleCopyField('seoKeywords', 'Keywords copied to clipboard')}
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Enter SEO keywords, separated by commas"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FeaturedImageField form={form} />
    </div>
  );
}

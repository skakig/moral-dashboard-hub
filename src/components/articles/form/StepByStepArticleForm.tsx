
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Wand2, Mic, Play, Pause, Download, Save, Loader2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// Components for each step
import { ThemeField } from "./components/ThemeField";
import { BasicInfoFields } from "./components/BasicInfoFields";
import { ContentTypeFields } from "./components/ContentTypeFields";
import { ContentConfigFields } from "./components/ContentConfigFields";
import { ContentField } from "./components/ContentField";
import { MetaDescriptionField } from "./components/MetaDescriptionField";
import { FeaturedImageField } from "./components/FeaturedImageField";

// Hooks
import { useVoiceGeneration } from "./hooks/useVoiceGeneration";
import { useAIGeneration } from "./hooks/useAIGeneration";

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

// The form schema
const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().optional(),
  contentType: z.string().optional(),
  platform: z.string().optional(),
  contentLength: z.string().optional(),
  tone: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  voiceUrl: z.string().optional(),
  voiceGenerated: z.boolean().optional().default(false),
  moralLevel: z.string().or(z.number()).optional().default(5),
  theme: z.string().optional(),
  voiceFileName: z.string().optional(),
  voiceBase64: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface StepByStepArticleFormProps {
  initialData?: Partial<ArticleFormValues>;
  onSubmit?: (values: ArticleFormValues) => void;
  submitLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
}

type Step = {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isRequired?: boolean;
};

export function StepByStepArticleForm({
  initialData = {},
  onSubmit: onFormSubmit,
  submitLabel = "Create",
  onCancel,
  isLoading = false,
}: StepByStepArticleFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM"); // Default to Rachel
  const [autoGenerateContent, setAutoGenerateContent] = useState(true);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      contentType: "",
      platform: "",
      contentLength: "medium",
      tone: "informative",
      metaDescription: "",
      seoKeywords: "",
      voiceUrl: "",
      voiceGenerated: false,
      moralLevel: 5,
      theme: "",
      ...initialData,
    },
  });

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

        // Move to the content step
        const contentStepIndex = steps.findIndex(step => step.id === 'content');
        if (contentStepIndex !== -1) {
          setCurrentStepIndex(contentStepIndex);
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
  const handleCopyField = (fieldName: keyof ArticleFormValues, successMessage: string) => {
    const value = form.getValues(fieldName);
    if (value) {
      navigator.clipboard.writeText(String(value));
      toast.success(successMessage);
    } else {
      toast.error(`No ${fieldName} to copy`);
    }
  };

  // Define steps
  const steps: Step[] = [
    {
      id: 'theme',
      title: 'Theme/Topic',
      description: 'What would you like to write about?',
      component: (
        <div className="space-y-4">
          <ThemeField form={form} onGenerate={handleGenerateContent} autoGenerate={autoGenerateContent} />
          
          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="autoGenerate"
              checked={autoGenerateContent}
              onChange={(e) => setAutoGenerateContent(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="autoGenerate" className="text-sm">
              Auto-generate content when I finish typing
            </label>
          </div>
        </div>
      ),
      isRequired: true,
    },
    {
      id: 'platform-type',
      title: 'Platform & Content Type',
      description: 'Where will your content be published and what type will it be?',
      component: (
        <div className="space-y-4">
          <ContentTypeFields 
            form={form} 
            platform={form.watch("platform")} 
            setContentType={(value) => form.setValue("contentType", value)} 
            setPlatform={(value) => form.setValue("platform", value)} 
          />
        </div>
      ),
      isRequired: true,
    },
    {
      id: 'config',
      title: 'Content Configuration',
      description: 'Configure the tone, length, and moral level of your content',
      component: (
        <div className="space-y-4">
          <ContentConfigFields 
            form={form} 
            setContentLength={(value) => form.setValue("contentLength", value)} 
          />
        </div>
      ),
      isRequired: false,
    },
    {
      id: 'content',
      title: 'Content',
      description: 'Write or generate your content',
      component: (
        <div className="space-y-4">
          <ContentField 
            form={form} 
            isGenerating={isGeneratingContent} 
            onGenerate={handleGenerateContent} 
          />
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => handleGenerateContent()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Revise Content
            </Button>
          </div>
        </div>
      ),
      isRequired: true,
    },
    {
      id: 'metadata',
      title: 'SEO & Metadata',
      description: 'Add metadata for better visibility',
      component: (
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
                    onClick={() => handleCopyField("seoKeywords", 'Keywords copied to clipboard')}
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
      ),
      isRequired: false,
    },
    {
      id: 'voice',
      title: 'Voice Content',
      description: 'Generate voice content from your text',
      component: (
        <div className="space-y-4">
          {form.watch("content") ? (
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
            </div>
          ) : (
            <div className="text-muted-foreground">
              Please add content before generating voice.
            </div>
          )}
        </div>
      ),
      isRequired: false,
    },
    {
      id: 'featured-image',
      title: 'Featured Image',
      description: 'Add a featured image for your content',
      component: (
        <div className="space-y-4">
          <FeaturedImageField form={form} />
        </div>
      ),
      isRequired: false,
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Add title and excerpt for your content',
      component: (
        <div className="space-y-4">
          <BasicInfoFields form={form} />
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => handleCopyField("title", 'Title copied to clipboard')}
              className="flex items-center gap-1"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Title
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => handleCopyField("excerpt", 'Excerpt copied to clipboard')}
              className="flex items-center gap-1"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Excerpt
            </Button>
          </div>
        </div>
      ),
      isRequired: true,
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToNextStep = () => {
    if (currentStep.isRequired) {
      // Check if the fields for this step are valid
      let isValid = true;
      
      if (currentStep.id === 'theme' && !form.getValues("theme")) {
        form.setError("theme", { type: "required", message: "Theme is required" });
        isValid = false;
      }
      
      if (currentStep.id === 'platform-type' && (!form.getValues("platform") || !form.getValues("contentType"))) {
        if (!form.getValues("platform")) {
          toast.error("Please select a platform");
        }
        if (!form.getValues("contentType")) {
          toast.error("Please select a content type");
        }
        isValid = false;
      }
      
      if (currentStep.id === 'content' && !form.getValues("content")) {
        form.setError("content", { type: "required", message: "Content is required" });
        isValid = false;
      }
      
      if (currentStep.id === 'basic-info' && !form.getValues("title")) {
        form.setError("title", { type: "required", message: "Title is required" });
        isValid = false;
      }
      
      if (!isValid) return;
    }
    
    setCurrentStepIndex(prev => (prev < steps.length - 1 ? prev + 1 : prev));
  };

  const goToPreviousStep = () => {
    setCurrentStepIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleSubmit = async (data: ArticleFormValues) => {
    try {
      if (onFormSubmit) {
        await onFormSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting article form:", error);
      toast.error("Failed to save article");
    }
  };

  // Check if we can auto-generate content (when theme, platform, and contentType are filled)
  const canAutoGenerate = form.watch("theme") && form.watch("platform") && form.watch("contentType");

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{currentStep.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              {currentStep.component}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={isFirstStep}
                  className="mr-2"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                {!isLastStep && (
                  <Button type="button" onClick={goToNextStep}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                {currentStep.id === 'theme' && canAutoGenerate && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGenerateContent}
                    disabled={isGeneratingContent}
                    className="ml-2"
                  >
                    {isGeneratingContent ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate & Continue
                      </>
                    )}
                  </Button>
                )}
                {isLastStep && (
                  <Button type="submit" disabled={isLoading} className="ml-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {submitLabel}
                      </>
                    )}
                  </Button>
                )}
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} className="ml-2">
                    Cancel
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

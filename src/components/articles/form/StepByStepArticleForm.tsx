import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Import components
import { StepHeader } from "./step-form/StepHeader";
import { StepControls } from "./step-form/StepControls";
import {
  ThemeStep,
  PlatformTypeStep,
  ConfigStep,
  ContentStep,
  MetadataStep,
  VoiceStep,
  FeaturedImageStep,
  BasicInfoStep
} from "./step-form/steps";

// Import hooks and types
import { useVoiceGeneration } from "./hooks/useVoiceGeneration";
import { useAIGeneration } from "./hooks/useAIGeneration";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { ArticleFormValues, articleFormSchema, Step } from "./step-form/types";

export type { ArticleFormValues } from "./step-form/types";

interface StepByStepArticleFormProps {
  initialData?: Partial<ArticleFormValues>;
  onSubmit?: (values: ArticleFormValues) => void;
  submitLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
}

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
  const [autoGenerateOptions, setAutoGenerateOptions] = useState({
    voice: false,
    image: false,
  });
  
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
    mode: "onSubmit" // Change to onSubmit to prevent premature validation
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
  const { generateImage, loading: isGeneratingImage } = useImageGeneration();

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
        moralLevel: typeof moralLevel === 'string' ? parseInt(moralLevel, 10) : moralLevel,
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

        // If auto-generate voice is enabled, generate voice content
        if (autoGenerateOptions.voice) {
          // Move to content step first to ensure content is available
          const contentStepIndex = steps.findIndex(step => step.id === 'content');
          if (contentStepIndex !== -1) {
            setCurrentStepIndex(contentStepIndex);
            
            // Wait a bit for the UI to update before generating voice
            setTimeout(async () => {
              await generateVoiceContent(selectedVoice);
              toast.success("Voice content generated successfully");
            }, 500);
          }
        }
        
        // If auto-generate image is enabled, generate featured image
        if (autoGenerateOptions.image) {
          const imagePrompt = `Create a high-quality featured image for: ${content.title}. Platform: ${platform}, Content type: ${contentType}`;
          
          const imageUrl = await generateImage(imagePrompt, platform);
          if (imageUrl) {
            form.setValue("featuredImage", imageUrl, { shouldDirty: true });
            toast.success("Featured image generated successfully");
          }
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

  // Define steps
  const steps: Step[] = [
    {
      id: 'theme',
      title: 'Theme/Topic',
      description: 'What would you like to write about?',
      component: (
        <ThemeStep 
          form={form} 
          onGenerate={handleGenerateContent} 
          autoGenerate={autoGenerateContent} 
          setAutoGenerate={setAutoGenerateContent}
          autoGenerateOptions={autoGenerateOptions}
          setAutoGenerateOptions={setAutoGenerateOptions}
        />
      ),
      isRequired: true,
    },
    {
      id: 'platform-type',
      title: 'Platform & Content Type',
      description: 'Where will your content be published and what type will it be?',
      component: (
        <PlatformTypeStep form={form} />
      ),
      isRequired: true,
    },
    {
      id: 'config',
      title: 'Content Configuration',
      description: 'Configure the tone, length, and moral level of your content',
      component: (
        <ConfigStep 
          form={form} 
          setContentLength={(value) => form.setValue("contentLength", value)} 
        />
      ),
      isRequired: false,
    },
    {
      id: 'content',
      title: 'Content',
      description: 'Write or generate your content',
      component: (
        <ContentStep 
          form={form} 
          isGenerating={isGeneratingContent} 
          onGenerate={handleGenerateContent} 
        />
      ),
      isRequired: true,
    },
    {
      id: 'metadata',
      title: 'SEO & Metadata',
      description: 'Add metadata for better visibility',
      component: (
        <MetadataStep form={form} />
      ),
      isRequired: false,
    },
    {
      id: 'voice',
      title: 'Voice Content',
      description: 'Generate voice content from your text',
      component: (
        <VoiceStep 
          form={form}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          isGenerating={isGeneratingVoice}
          isPlaying={isPlaying}
          audioUrl={audioUrl}
          onGenerate={handleGenerateVoice}
          togglePlayPause={togglePlayPause}
          setIsPlaying={setIsPlaying}
          downloadAudio={downloadAudio}
        />
      ),
      isRequired: false,
    },
    {
      id: 'featured-image',
      title: 'Featured Image',
      description: 'Add a featured image for your content',
      component: (
        <FeaturedImageStep form={form} />
      ),
      isRequired: false,
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Add title and excerpt for your content',
      component: (
        <BasicInfoStep form={form} />
      ),
      isRequired: true,
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToNextStep = () => {
    // Only validate fields required for the current step
    if (currentStep.isRequired) {
      let isValid = true;
      
      if (currentStep.id === 'theme' && !form.getValues("theme")) {
        form.setError("theme", { type: "required", message: "Theme is required" });
        isValid = false;
      }
      
      if (currentStep.id === 'platform-type') {
        if (!form.getValues("platform")) {
          toast.error("Please select a platform");
          isValid = false;
        }
        if (!form.getValues("contentType")) {
          toast.error("Please select a content type");
          isValid = false;
        }
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
      // If we have a title but no content, ensure we require content
      if (data.title && !data.content) {
        form.setError("content", { 
          type: "required", 
          message: "Content is required when providing a title" 
        });
        return;
      }
      
      if (onFormSubmit) {
        await onFormSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting article form:", error);
      toast.error("Failed to save article");
    }
  };

  // Check if we can auto-generate content (when theme, platform, and contentType are filled)
  const canAutoGenerate = Boolean(form.watch("theme") && form.watch("platform") && form.watch("contentType"));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Card className="w-full">
            <StepHeader 
              title={currentStep.title} 
              description={currentStep.description} 
              progress={((currentStepIndex + 1) / steps.length) * 100} 
            />
            
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              {currentStep.component}
            </CardContent>
            
            <StepControls 
              isFirstStep={isFirstStep} 
              isLastStep={isLastStep} 
              isLoading={isLoading} 
              submitLabel={submitLabel}
              canAutoGenerate={currentStep.id === 'theme' && canAutoGenerate}
              isGeneratingContent={isGeneratingContent}
              onPrevious={goToPreviousStep}
              onNext={goToNextStep}
              onCancel={onCancel}
              onGenerate={handleGenerateContent}
            />
          </Card>
        </form>
      </Form>
    </div>
  );
}

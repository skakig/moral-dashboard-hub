
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Import types and components
import { ArticleFormValues, articleFormSchema } from "./step-form/types";
import { ArticleFormLayout } from "./step-form/ArticleFormLayout";
import { useArticleFormSteps } from "./step-form/hooks/useArticleFormSteps";
import { useAutoGenerateOptions } from "./step-form/hooks/useAutoGenerateOptions";
import { useContentGeneration } from "./step-form/hooks/useContentGeneration";

// Import step components
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
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM"); // Default to Rachel
  
  // Form setup
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
    mode: "onSubmit"
  });

  // Auto-generate options
  const {
    autoGenerateContent,
    setAutoGenerateContent,
    autoGenerateOptions,
    updateAutoGenerateOptions
  } = useAutoGenerateOptions();

  // Handle platform changes for content length
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "platform") {
        // Set default content length based on platform
        const platform = value.platform;
        if (platform === "YouTube") {
          form.setValue("contentLength", "long");
        } else if (platform === "Instagram" || platform === "Twitter" || platform === "TikTok") {
          form.setValue("contentLength", "short");
        } else if (platform === "Facebook" || platform === "LinkedIn") {
          form.setValue("contentLength", "medium");
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Content generation logic - defined BEFORE it's used in steps
  const {
    isGeneratingContent,
    isGeneratingVoice,
    isPlaying,
    audioUrl,
    handleGenerateContent,
    handleGenerateVoice,
    togglePlayPause,
    downloadAudio,
    setIsPlaying
  } = useContentGeneration(
    form,
    autoGenerateOptions,
    selectedVoice,
    (stepId) => goToStepById(stepId)
  );

  // Define steps
  const steps = [
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
          setAutoGenerateOptions={updateAutoGenerateOptions}
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
          data={form.getValues()}
          onDataChange={(data) => {
            Object.entries(data).forEach(([key, value]) => {
              form.setValue(key as any, value);
            });
          }}
          onNext={() => goToNextStep()}
          onBack={() => goToPreviousStep()}
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
          onNext={() => goToNextStep()}
          onBack={() => goToPreviousStep()}
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
          onNext={() => goToNextStep()}
          onBack={() => goToPreviousStep()}
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

  // Step navigation
  const {
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStepById,
    canAutoGenerate,
    nextStepTitle
  } = useArticleFormSteps(form, steps, handleGenerateContent);

  // Form submission
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
      
      // Convert moralLevel to number if it's a string
      if (typeof data.moralLevel === 'string') {
        data.moralLevel = parseInt(data.moralLevel, 10);
      }
      
      if (onFormSubmit) {
        await onFormSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting article form:", error);
      toast.error("Failed to save article");
    }
  };

  return (
    <ArticleFormLayout
      form={form}
      title={currentStep.title}
      description={currentStep.description}
      progress={((currentStepIndex + 1) / steps.length) * 100}
      error={error}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      isLoading={isLoading}
      submitLabel={submitLabel}
      canAutoGenerate={currentStep.id === 'theme' && canAutoGenerate}
      isGeneratingContent={isGeneratingContent}
      onSubmit={handleSubmit}
      onPrevious={goToPreviousStep}
      onNext={goToNextStep}
      onCancel={onCancel}
      onGenerate={handleGenerateContent}
      nextStepTitle={nextStepTitle}
    />
  );
}

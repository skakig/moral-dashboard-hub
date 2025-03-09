
import { useState } from "react";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { ArticleFormValues, Step } from "../types";

export function useArticleFormSteps(
  form: UseFormReturn<ArticleFormValues>,
  steps: Step[],
  handleGenerateContent: () => Promise<void>
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
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

  const goToStepById = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  };

  // Check if we can auto-generate content (when theme, platform, and contentType are filled)
  const canAutoGenerate = Boolean(form.watch("theme") && form.watch("platform") && form.watch("contentType"));

  return {
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStepById,
    canAutoGenerate
  };
}

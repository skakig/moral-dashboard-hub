
import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { Step } from "../types";

export function useArticleFormSteps(
  form: UseFormReturn<any>,
  steps: Step[],
  autoGenerateHandler?: () => Promise<void>
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Get valid steps based on form state
  const getValidSteps = useCallback(() => {
    return steps.filter(step => !step.isRequired || form.getValues()[step.id]);
  }, [steps, form]);

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, steps.length]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  // Go to a specific step by ID
  const goToStepById = useCallback((id: string) => {
    const stepIndex = steps.findIndex(step => step.id === id);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  }, [steps]);

  // Determine if we can auto-generate content
  const canAutoGenerate = useCallback(() => {
    const theme = form.getValues("theme");
    const platform = form.getValues("platform");
    const contentType = form.getValues("contentType");
    
    return Boolean(theme && platform && contentType && autoGenerateHandler);
  }, [form, autoGenerateHandler]);

  // Get the title of the next step
  const getNextStepTitle = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      return steps[currentStepIndex + 1].title;
    }
    return null;
  }, [currentStepIndex, steps]);

  return {
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStepById,
    canAutoGenerate: canAutoGenerate(),
    nextStepTitle: getNextStepTitle()
  };
}

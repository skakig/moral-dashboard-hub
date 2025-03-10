
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Save, Wand2 } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

interface StepControlsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  submitLabel: string;
  canAutoGenerate?: boolean;
  isGeneratingContent?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel?: () => void;
  onGenerate?: () => void;
}

export function StepControls({ 
  isFirstStep, 
  isLastStep, 
  isLoading, 
  submitLabel, 
  canAutoGenerate, 
  isGeneratingContent,
  onPrevious, 
  onNext, 
  onCancel,
  onGenerate
}: StepControlsProps) {
  return (
    <CardFooter className="flex justify-between">
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="mr-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        {!isLastStep && (
          <Button type="button" onClick={onNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div>
        {canAutoGenerate && onGenerate && (
          <Button
            type="button"
            variant="secondary"
            onClick={onGenerate}
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
  );
}

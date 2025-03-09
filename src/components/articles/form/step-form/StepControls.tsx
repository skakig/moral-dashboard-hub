
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

interface StepControlsProps {
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  onGenerate?: () => void;
  isLoading?: boolean;
  isGeneratingContent?: boolean;
  submitLabel?: string;
  canAutoGenerate?: boolean;
  onBack?: () => void;
}

export function StepControls({
  isFirstStep,
  isLastStep,
  onPrevious,
  onNext,
  onCancel,
  onGenerate,
  isLoading,
  isGeneratingContent = false,
  submitLabel = "Create",
  canAutoGenerate = false,
  onBack,
}: StepControlsProps) {
  return (
    <CardFooter className="flex justify-between p-6 pt-0">
      <div>
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious || onBack} // Use onPrevious if available, otherwise onBack
            className="mr-2"
          >
            Previous
          </Button>
        )}
        
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        {canAutoGenerate && onGenerate && (
          <Button
            type="button"
            variant="outline"
            onClick={onGenerate}
            disabled={isGeneratingContent}
            className="flex items-center"
          >
            {isGeneratingContent ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Now
              </>
            )}
          </Button>
        )}
        
        {isLastStep ? (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        ) : (
          <Button type="button" onClick={onNext}>
            Next
          </Button>
        )}
      </div>
    </CardFooter>
  );
}

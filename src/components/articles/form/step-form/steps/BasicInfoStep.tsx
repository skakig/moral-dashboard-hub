
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { BasicInfoFields } from "../../components/BasicInfoFields";
import { ArticleFormValues } from "../../StepByStepArticleForm";
import { toast } from "sonner";

interface BasicInfoStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const handleCopyField = (fieldName: keyof ArticleFormValues, successMessage: string) => {
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
  );
}

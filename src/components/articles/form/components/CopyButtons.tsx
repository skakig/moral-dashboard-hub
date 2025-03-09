
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";

interface CopyButtonsProps {
  form: UseFormReturn<any>;
  fields: Array<{
    name: string;
    label: string;
  }>;
}

export function CopyButtons({ form, fields }: CopyButtonsProps) {
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
    <div className="flex justify-end space-x-2">
      {fields.map((field) => (
        <Button 
          key={field.name}
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => handleCopyField(field.name, `${field.label} copied to clipboard`)}
          className="flex items-center gap-1"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy {field.label}
        </Button>
      ))}
    </div>
  );
}

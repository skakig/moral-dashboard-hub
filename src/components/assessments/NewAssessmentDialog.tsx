
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { 
  AssessmentFormFields, 
  assessmentFormSchema, 
  AssessmentFormValues 
} from "./AssessmentFormFields";
import { useAssessmentData } from "@/hooks/useAssessmentData";

interface NewAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
}

export function NewAssessmentDialog({
  open,
  onOpenChange,
  onSubmit,
}: NewAssessmentDialogProps) {
  // Use our custom hook to fetch assessment data
  const { categories, moralLevels, loadingCategories, loadingLevels } = useAssessmentData();

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      title: "",
      category: "",
      level: 1,
      description: "",
      status: "draft",
      time_limit_seconds: 60,
      sequential_logic_enabled: true,
    },
  });

  const handleSubmit = async (values: AssessmentFormValues) => {
    try {
      // Insert the new assessment into Supabase
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          title: values.title,
          category: values.category,
          level: values.level,
          description: values.description || "",
          status: values.status,
          time_limit_seconds: values.time_limit_seconds,
          sequential_logic_enabled: values.sequential_logic_enabled,
        })
        .select();

      if (error) {
        console.error("Error creating assessment:", error);
        toast.error("Failed to create assessment: " + error.message);
        return;
      }

      toast.success("Assessment created successfully");
      
      // Call the parent's onSubmit if provided
      if (onSubmit && data) {
        onSubmit(data[0]);
      }
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
          <DialogDescription>
            Add a new moral assessment to the system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <AssessmentFormFields 
              form={form}
              categories={categories}
              moralLevels={moralLevels}
              loadingCategories={loadingCategories}
              loadingLevels={loadingLevels}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Create Assessment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

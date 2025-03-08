
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Types for categories and moral levels
interface Category {
  id: string;
  name: string;
}

interface MoralLevel {
  id: number;
  level: number;
  name: string;
}

// Schema for form validation
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  category_id: z.string().min(2, { message: "Please select a category" }),
  level_id: z.string().min(1, { message: "Please select a moral level" }),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "inactive"]),
});

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
  // Fetch categories from Supabase
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
        return [];
      }
      
      return data as Category[];
    },
  });

  // Fetch moral levels from Supabase
  const { data: moralLevels, isLoading: loadingLevels } = useQuery({
    queryKey: ['moralLevels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moral_levels')
        .select('*')
        .order('level');
      
      if (error) {
        console.error("Error fetching moral levels:", error);
        toast.error("Failed to load moral levels");
        return [];
      }
      
      return data as MoralLevel[];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category_id: "",
      level_id: "",
      description: "",
      status: "draft",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Insert the new assessment into Supabase
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          title: values.title,
          category_id: values.category_id,
          level_id: parseInt(values.level_id),
          description: values.description || "",
          status: values.status,
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
          <DialogDescription>
            Add a new moral assessment to the system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter assessment title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, descriptive title for the assessment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The category helps organize assessments by type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moral Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingLevels}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a moral level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {moralLevels?.map((level) => (
                        <SelectItem key={level.id} value={level.id.toString()}>
                          Level {level.level}: {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The moral level this assessment is designed to evaluate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a brief description of this assessment"
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Controls whether this assessment is available to users
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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

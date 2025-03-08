
import React from "react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import {
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

// Types for categories and moral levels
export interface Category {
  id: string;
  name: string;
}

export interface MoralLevel {
  id: number;
  level: number;
  name: string;
}

// Schema for form validation
export const assessmentFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  category_id: z.string().min(2, { message: "Please select a category" }),
  level_id: z.string().min(1, { message: "Please select a moral level" }),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "inactive"]),
});

export type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormFieldsProps {
  form: UseFormReturn<AssessmentFormValues>;
  categories?: Category[];
  moralLevels?: MoralLevel[];
  loadingCategories: boolean;
  loadingLevels: boolean;
}

export function AssessmentFormFields({
  form,
  categories,
  moralLevels,
  loadingCategories,
  loadingLevels,
}: AssessmentFormFieldsProps) {
  return (
    <>
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
    </>
  );
}


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Category, MoralLevel } from "@/components/assessments/AssessmentFormFields";

export function useAssessmentData() {
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

  return {
    categories,
    moralLevels,
    loadingCategories,
    loadingLevels
  };
}

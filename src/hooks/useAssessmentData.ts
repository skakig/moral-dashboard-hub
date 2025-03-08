
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
}

export interface MoralLevel {
  id: number;
  level: number;
  name: string;
}

export function useAssessmentData() {
  // Fetch categories from Supabase
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // First try to fetch from the new assessment_category enum type
      try {
        const { data: enumData, error: enumError } = await supabase
          .rpc('get_enum_values', { enum_name: 'assessment_category' });
        
        if (!enumError && enumData) {
          // Transform enum values to match the Category interface
          return enumData.map((name: string, index: number) => ({
            id: name,
            name: name
          })) as Category[];
        }
      } catch (error) {
        console.log("Enum fetch failed, falling back to table", error);
      }
      
      // Fallback to the original table-based approach
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

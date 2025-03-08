
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
      // First try to fetch from the assessment_categories table
      try {
        const { data: tableData, error: tableError } = await supabase
          .from('assessment_categories')
          .select('*')
          .order('name');
        
        if (!tableError && tableData && tableData.length > 0) {
          return tableData as Category[];
        }
      } catch (error) {
        console.log("Category fetch from table failed", error);
      }
      
      // Try to fetch from enum type if table approach fails
      try {
        const { data: enumData, error: enumError } = await supabase
          .from('assessment_categories')
          .select('*')
          .order('name');
        
        if (!enumError && enumData) {
          return enumData as Category[];
        }
      } catch (error) {
        console.log("Category fetch from enum failed", error);
      }
      
      // Return default categories if all fetches fail
      return [
        { id: 'Moral Dilemma', name: 'Moral Dilemma' },
        { id: 'Professional Ethics', name: 'Professional Ethics' },
        { id: 'Social Dynamics', name: 'Social Dynamics' },
        { id: 'Global Ethics', name: 'Global Ethics' },
        { id: 'Personal Values', name: 'Personal Values' }
      ] as Category[];
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

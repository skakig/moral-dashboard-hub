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

export interface Assessment {
  id: string;
  title: string;
  category: { id: string; name: string };
  level: { id: number; level: number; name: string };
  status: string;
  description: string | null;
  questions_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  time_limit_seconds?: number;
  sequential_logic_enabled?: boolean;
}

export function useAssessments() {
  // Fetch assessments from Supabase
  const { data: assessments, isLoading, error } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*, category:category_id(id, name), level:level_id(id, level, name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching assessments:", error);
        toast.error("Failed to load assessments");
        return [];
      }

      return data;
    },
  });

  const formatAssessments = (data: any[]): Assessment[] => {
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      category: {
        id: item.category.id,
        name: item.category.name,
      },
      level: {
        id: item.level.id,
        level: item.level.level,
        name: item.level.name,
      },
      status: item.status,
      description: item.description,
      questions_count: item.questions_count,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      time_limit_seconds: 60, // Default value as fallback
      sequential_logic_enabled: false, // Default value as fallback
    }));
  };

  const formattedAssessments = assessments ? formatAssessments(assessments) : [];

  return {
    assessments: formattedAssessments,
    isLoading,
    error,
  };
}


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
  time_limit_seconds: number;
  sequential_logic_enabled: boolean;
}

export function useAssessments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  // Fetch assessments from Supabase
  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey: ['assessments', searchTerm, filterLevel],
    queryFn: async () => {
      let query = supabase
        .from('assessments')
        .select('*, category:category_id(id, name), level:level_id(id, level, name)');

      // Apply search filter if provided
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      // Apply level filter if provided
      if (filterLevel !== 'all') {
        const [minLevel, maxLevel] = filterLevel.split('-').map(Number);
        query = query.gte('level_id', minLevel).lte('level_id', maxLevel);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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
        id: item.category?.id || '',
        name: item.category?.name || '',
      },
      level: {
        id: item.level?.id || 0,
        level: item.level?.level || 0,
        name: item.level?.name || '',
      },
      status: item.status,
      description: item.description,
      questions_count: item.questions_count,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      time_limit_seconds: item.time_limit_seconds || 60, // Default value as fallback
      sequential_logic_enabled: item.sequential_logic_enabled || false, // Default value as fallback
    }));
  };

  const formattedAssessments = assessments ? formatAssessments(assessments) : [];

  // Handle deleting an assessment
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting assessment:", error);
        toast.error("Failed to delete assessment");
        return;
      }

      toast.success("Assessment deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return {
    assessments: formattedAssessments,
    isLoading,
    error,
    refetch,
    handleDelete,
    searchTerm,
    setSearchTerm,
    filterLevel,
    setFilterLevel
  };
}

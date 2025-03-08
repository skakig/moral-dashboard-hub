
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Assessment } from "@/components/assessments/AssessmentsTable";

export function useAssessments() {
  const [filterLevel, setFilterLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch assessments from Supabase
  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey: ['assessments', filterLevel, searchTerm],
    queryFn: async () => {
      // Start with a base query
      let query = supabase
        .from('assessments')
        .select(`
          id, 
          title, 
          category_id,
          level_id,
          status, 
          description,
          questions_count,
          is_active,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      // Apply level filtering if needed
      if (filterLevel !== "all") {
        const [min, max] = filterLevel.split("-").map(Number);
        query = query.gte('level_id', min).lte('level_id', max);
      }

      // Apply search term if provided
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching assessments:", error);
        toast.error("Failed to load assessments");
        return [];
      }

      // Transform the data to match the expected format in the UI
      if (data) {
        return data.map(assessment => ({
          ...assessment,
          category: {
            id: assessment.category_id,
            name: assessment.category_id
          },
          level: {
            id: assessment.level_id,
            level: assessment.level_id,
            name: `Level ${assessment.level_id}`
          },
          // Add missing properties required by the Assessment type
          time_limit_seconds: 30, // Default value
          sequential_logic_enabled: false // Default value
        })) as Assessment[];
      }
      
      return [];
    },
  });

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
      console.error("Error in delete operation:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return {
    assessments,
    isLoading,
    error,
    refetch,
    handleDelete,
    filterLevel,
    setFilterLevel,
    searchTerm,
    setSearchTerm
  };
}

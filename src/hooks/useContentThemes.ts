
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ContentTheme } from "@/types/articles";

export function useContentThemes() {
  const queryClient = useQueryClient();

  // Fetch content themes from Supabase
  const { data: themes, isLoading, error } = useQuery({
    queryKey: ['contentThemes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_themes')
        .select('*')
        .order('name');

      if (error) {
        console.error("Error fetching content themes:", error);
        toast.error("Failed to load content themes");
        return [];
      }

      return data as ContentTheme[];
    },
  });

  // Create new theme
  const createTheme = useMutation({
    mutationFn: async (theme: Omit<ContentTheme, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('content_themes')
        .insert(theme)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentThemes'] });
      toast.success("Theme created successfully");
    },
    onError: (error) => {
      console.error("Error creating theme:", error);
      toast.error("Failed to create theme");
    },
  });

  // Update existing theme
  const updateTheme = useMutation({
    mutationFn: async ({ id, ...theme }: Partial<ContentTheme> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_themes')
        .update(theme)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentThemes'] });
      toast.success("Theme updated successfully");
    },
    onError: (error) => {
      console.error("Error updating theme:", error);
      toast.error("Failed to update theme");
    },
  });

  // Delete theme
  const deleteTheme = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_themes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentThemes'] });
      toast.success("Theme deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting theme:", error);
      toast.error("Failed to delete theme");
    },
  });

  return {
    themes,
    isLoading,
    error,
    createTheme,
    updateTheme,
    deleteTheme,
  };
}

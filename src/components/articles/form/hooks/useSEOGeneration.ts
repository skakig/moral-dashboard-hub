
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for generating SEO metadata for articles
 */
export function useSEOGeneration(form: UseFormReturn<any>) {
  const generateSEOData = async () => {
    try {
      toast.info("Generating SEO data...");
      
      const content = form.getValues("content") || "";
      const theme = form.getValues("theme") || "";
      const platform = form.getValues("platform") || "general";
      const contentType = form.getValues("contentType") || "article";
      
      if (!content && !theme) {
        toast.error("Please enter content or theme first");
        return;
      }
      
      // Call the edge function to generate SEO data
      const { data, error } = await supabase.functions.invoke("generate-seo-data", {
        body: { content, theme, platform, contentType }
      });
      
      if (error) throw error;
      
      // Update form fields with generated data
      form.setValue("metaDescription", data.metaDescription);
      form.setValue("keywords", data.keywords.join(", "));
      
      toast.success("SEO data generated successfully!");
    } catch (error) {
      console.error("Error generating SEO data:", error);
      toast.error("Failed to generate SEO data");
    }
  };

  return { generateSEOData };
}

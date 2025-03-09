
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for generating featured images for articles
 */
export function useImageGeneration(form: UseFormReturn<any>) {
  const generateImage = async () => {
    try {
      toast.info("Generating featured image...");
      
      const theme = form.getValues("theme") || "";
      const content = form.getValues("content") || "";
      const platform = form.getValues("platform") || "general";
      
      if (!theme && !content) {
        toast.error("Please enter a theme or content first");
        return;
      }
      
      // Call the edge function to generate an image
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { 
          contentType: "image",
          text: theme || content.substring(0, 100),
          moralLevel: form.getValues("moralLevel") || 5,
          platform
        }
      });
      
      if (error) throw error;
      
      // Update form with image URL
      form.setValue("featuredImageUrl", data.imageUrl);
      
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    }
  };

  return { generateImage };
}

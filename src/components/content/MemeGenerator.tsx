import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemePreview } from "./MemePreview";
import { MemesList } from "./MemesList";
import { Meme } from "@/types/content";

const memeFormSchema = z.object({
  memeText: z.string().min(5, { message: "Meme text must be at least 5 characters" }),
  targetPlatforms: z.array(z.string()).min(1, { message: "Select at least one platform" }),
  moralLevel: z.number().min(1).max(9),
  themeKeywords: z.string().optional(),
});

type MemeFormValues = z.infer<typeof memeFormSchema>;

export function MemeGenerator() {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const form = useForm<MemeFormValues>({
    resolver: zodResolver(memeFormSchema),
    defaultValues: {
      memeText: "",
      targetPlatforms: ["Instagram"],
      moralLevel: 5,
      themeKeywords: "",
    },
  });

  const onSubmit = async (values: MemeFormValues) => {
    setLoading(true);
    try {
      toast.info("Generating meme with AI...");
      
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { 
          contentType: "meme", 
          text: values.memeText,
          moralLevel: values.moralLevel,
          platform: values.targetPlatforms[0]
        }
      });
      
      if (error) throw error;
      
      setPreviewImage(data.imageUrl);
      toast.success("Meme generated successfully!");
    } catch (error) {
      console.error("Error generating meme:", error);
      toast.error("Failed to generate meme");
    } finally {
      setLoading(false);
    }
  };
  
  const saveMeme = async () => {
    if (!previewImage) return;
    
    try {
      toast.info("Saving meme to database...");
      
      const memeData = {
        meme_text: form.getValues("memeText"),
        image_url: previewImage,
        platform_tags: form.getValues("targetPlatforms"),
        engagement_score: Math.random() * 10,
      };
      
      const { data, error } = await supabase
        .from('memes')
        .insert(memeData as any)
        .select();
      
      if (error) throw error;
      
      toast.success("Meme saved to database!");
      form.reset();
      setPreviewImage(null);
    } catch (error) {
      console.error("Error saving meme:", error);
      toast.error("Failed to save meme");
    }
  };

  const platformOptions = [
    { value: "Instagram", label: "Instagram" },
    { value: "Twitter", label: "Twitter" },
    { value: "Facebook", label: "Facebook" },
    { value: "Reddit", label: "Reddit" },
    { value: "TikTok", label: "TikTok" },
  ];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="memeText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meme Text</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter the text for your meme... e.g., 'When someone justifies their actions with 'it was legal'...'" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  This text will be used to generate a witty meme related to morality.
                </FormDescription>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="moralLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Moral Level</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Which moral level should the meme appeal to?
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="themeKeywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Keywords (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., ethics, justice, community" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Keywords to influence the meme style
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-between mt-6">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Meme
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={saveMeme} 
              disabled={!previewImage}
            >
              Save Meme
            </Button>
          </div>
        </form>
      </Form>
      
      {previewImage && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Preview</h3>
          <MemePreview imageUrl={previewImage} text={form.getValues("memeText")} />
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Recent Memes</h3>
        <MemesList />
      </div>
    </div>
  );
}

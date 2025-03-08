import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Film } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { VideosList } from "./VideosList";
import { AIVideo } from "@/types/content";

const videoFormSchema = z.object({
  scriptText: z.string().min(20, { message: "Script must be at least 20 characters" }),
  platform: z.string().min(1),
  voiceStyle: z.string().min(1),
  duration: z.number().min(10).max(60),
  moralLevel: z.number().min(1).max(9),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

export function VideoGenerator() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      scriptText: "",
      platform: "TikTok",
      voiceStyle: "Authoritative",
      duration: 30,
      moralLevel: 5,
    },
  });

  const onSubmit = async (values: VideoFormValues) => {
    setLoading(true);
    try {
      toast.info("Generating video with AI...");
      
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { 
          contentType: "video", 
          text: values.scriptText,
          moralLevel: values.moralLevel,
          platform: values.platform,
          voiceStyle: values.voiceStyle,
          duration: values.duration
        }
      });
      
      if (error) throw error;
      
      const mockVideoUrl = "https://example.com/sample-video.mp4";
      setPreviewUrl(mockVideoUrl);
      
      toast.success("Video generated successfully!");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video");
    } finally {
      setLoading(false);
    }
  };
  
  const saveVideo = async () => {
    if (!previewUrl) return;
    
    try {
      toast.info("Saving video to database...");
      
      const { data, error } = await supabase
        .from('ai_videos')
        .insert({
          script_text: form.getValues("scriptText"),
          video_url: previewUrl,
          voice_style: form.getValues("voiceStyle"),
          platform_targeting: [form.getValues("platform")],
        } as any)
        .select();
      
      if (error) throw error;
      
      toast.success("Video saved to database!");
      form.reset();
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error("Failed to save video");
    }
  };

  const platformOptions = [
    { value: "TikTok", label: "TikTok" },
    { value: "Instagram", label: "Instagram Reels" },
    { value: "YouTube", label: "YouTube Shorts" },
    { value: "Facebook", label: "Facebook" },
  ];
  
  const voiceOptions = [
    { value: "Authoritative", label: "Authoritative" },
    { value: "Friendly", label: "Friendly & Approachable" },
    { value: "Inspirational", label: "Inspirational" },
    { value: "Educational", label: "Educational" },
    { value: "Dramatic", label: "Dramatic" },
  ];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="scriptText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Script</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write a script for your short-form video... e.g., 'Have you ever noticed how people at different moral levels respond to challenges?'" 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  This text will be converted to speech and used to generate a video.
                </FormDescription>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Platform</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platformOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="voiceStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice Style</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {voiceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Duration (seconds): {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={10}
                    max={60}
                    step={5}
                    value={[field.value]}
                    onValueChange={(values) => field.onChange(values[0])}
                  />
                </FormControl>
                <FormDescription>
                  Shorter videos (15-30s) perform best on TikTok and Reels
                </FormDescription>
              </FormItem>
            )}
          />
          
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
                  Which moral level should this video target?
                </FormDescription>
              </FormItem>
            )}
          />
          
          <div className="flex justify-between mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Film className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={saveVideo} 
              disabled={!previewUrl}
            >
              Save Video
            </Button>
          </div>
        </form>
      </Form>
      
      {previewUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Preview</h3>
          <div className="aspect-video bg-slate-800 rounded-md flex items-center justify-center text-white">
            <p>Video Preview (Mock)</p>
            {/* In a real implementation, this would be a video player */}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Recent Videos</h3>
        <VideosList />
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Video } from "lucide-react";
import { AIVideo } from "@/types/content";

export function VideosList() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('ai_videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) {
          console.error("Error fetching videos:", error);
          return [] as AIVideo[];
        }
        
        return data as AIVideo[];
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        return [] as AIVideo[];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-[120px] w-full mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return <p className="text-muted-foreground">No videos created yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos && videos.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          <div className="bg-slate-800 h-32 flex items-center justify-center text-white">
            <Video size={24} className="mr-2" />
            <span>Video Preview</span>
          </div>
          <div className="p-3">
            <p className="text-sm font-medium line-clamp-2">{video.script_text}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.isArray(video.platform_targeting) && video.platform_targeting.map((platform) => (
                <Badge key={platform} variant="outline" className="text-xs">
                  {platform}
                </Badge>
              ))}
              <Badge variant="secondary">
                {video.voice_style}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

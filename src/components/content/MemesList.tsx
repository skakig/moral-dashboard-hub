
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Meme {
  id: string;
  meme_text: string;
  image_url: string;
  platform_tags: string[];
  engagement_score: number;
  created_at: string;
}

export function MemesList() {
  const { data: memes, isLoading } = useQuery({
    queryKey: ['memes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) {
        console.error("Error fetching memes:", error);
        return [] as Meme[];
      }
      
      return data as Meme[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-[200px] w-full mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!memes || memes.length === 0) {
    return <p className="text-muted-foreground">No memes created yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {memes.map((meme) => (
        <Card key={meme.id} className="overflow-hidden">
          <img src={meme.image_url} alt={meme.meme_text} className="w-full h-36 object-cover" />
          <div className="p-3">
            <p className="text-sm font-medium truncate">{meme.meme_text}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.isArray(meme.platform_tags) && meme.platform_tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <Badge variant="secondary" className="ml-auto">
                Score: {typeof meme.engagement_score === 'number' ? meme.engagement_score.toFixed(1) : '0.0'}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

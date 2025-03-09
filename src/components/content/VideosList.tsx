
import React from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Download, Trash2 } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  createdAt: string;
}

// Mock data for demonstration
const mockVideos: VideoItem[] = [
  {
    id: "1",
    title: "AI Introduction to Ethics",
    duration: "00:30",
    thumbnailUrl: "https://via.placeholder.com/120x68/1f2937/ffffff?text=Video+1",
    createdAt: "2023-03-09T12:00:00Z"
  },
  {
    id: "2",
    title: "Moral Hierarchy Explained",
    duration: "01:15",
    thumbnailUrl: "https://via.placeholder.com/120x68/1f2937/ffffff?text=Video+2",
    createdAt: "2023-03-08T10:30:00Z"
  }
];

export function VideosList() {
  if (mockVideos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No videos generated yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mockVideos.map((video) => (
        <div key={video.id} className="flex flex-col sm:flex-row gap-3 p-2 rounded-lg hover:bg-accent/10">
          <div className="relative">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full sm:w-[120px] h-auto rounded object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
              {video.duration}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{video.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(video.createdAt).toLocaleDateString()}
            </p>
            <div className="flex mt-2 space-x-2">
              <Button variant="outline" size="sm" className="h-7 px-2">
                <PlayCircle className="h-3 w-3 mr-1" />
                Play
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

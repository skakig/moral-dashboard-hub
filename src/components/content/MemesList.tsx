
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface MemeItem {
  id: string;
  imageUrl: string;
  topText: string;
  bottomText: string;
  createdAt: string;
}

// Mock data for demonstration
const mockMemes: MemeItem[] = [
  {
    id: "1",
    imageUrl: "https://via.placeholder.com/150/1f2937/ffffff?text=Meme+1",
    topText: "When the code",
    bottomText: "finally works",
    createdAt: "2023-03-09T12:00:00Z"
  },
  {
    id: "2",
    imageUrl: "https://via.placeholder.com/150/1f2937/ffffff?text=Meme+2",
    topText: "AI generated",
    bottomText: "confusion",
    createdAt: "2023-03-08T10:30:00Z"
  },
  {
    id: "3",
    imageUrl: "https://via.placeholder.com/150/1f2937/ffffff?text=Meme+3",
    topText: "Debugging",
    bottomText: "at 3am",
    createdAt: "2023-03-07T15:45:00Z"
  }
];

export function MemesList() {
  if (mockMemes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No memes saved yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mockMemes.map((meme) => (
        <div key={meme.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10">
          <img
            src={meme.imageUrl}
            alt={`${meme.topText} ${meme.bottomText}`}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {meme.topText} {meme.bottomText}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(meme.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

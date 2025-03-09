
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemesList } from "../MemesList";
import { Meme } from "@/types/meme";

interface SavedMemesProps {
  memes: Meme[];
  isLoading: boolean;
  onEdit: (meme: Meme) => void;
  onDelete: (id: string) => void;
  onShare: (meme: Meme) => void;
}

export function SavedMemes({ memes, isLoading, onEdit, onDelete, onShare }: SavedMemesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Memes</CardTitle>
      </CardHeader>
      <CardContent>
        <MemesList 
          memes={memes} 
          isLoading={isLoading} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onShare={onShare} 
        />
      </CardContent>
    </Card>
  );
}

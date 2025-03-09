
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink, Share2, Loader2 } from "lucide-react";
import { Meme } from "@/types/meme";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";

interface MemesListProps {
  memes: Meme[];
  isLoading: boolean;
  onEdit: (meme: Meme) => void;
  onDelete: (id: string) => void;
  onShare: (platform: string, imageUrl: string, text: string, options?: any) => void;
}

export function MemesList({ memes, isLoading, onEdit, onDelete, onShare }: MemesListProps) {
  const { user } = useUser();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-16 h-16 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex space-x-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You need to be logged in to save and view memes</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please log in to access your saved memes
        </p>
      </div>
    );
  }

  if (memes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No memes saved yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Generate and save your first meme to see it here
        </p>
      </div>
    );
  }

  const handleShare = (meme: Meme) => {
    const text = `${meme.topText} ${meme.bottomText}`.trim();
    onShare(meme.platform || 'twitter', meme.imageUrl, text, {
      redirectUrl: "https://themh.io",
      tags: ["TheMoralHierarchy", "TMH", meme.platform]
    });
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {memes.map((meme) => (
        <div key={meme.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10">
          <img
            src={meme.imageUrl}
            alt={`${meme.topText} ${meme.bottomText}`}
            className="w-16 h-16 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {meme.topText} {meme.bottomText}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(meme.created_at)}
            </p>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onEdit(meme)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => handleShare(meme)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this meme. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(meme.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}

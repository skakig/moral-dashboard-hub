
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface ArticleAudioPlayerProps {
  voiceUrl?: string;
}

export function ArticleAudioPlayer({ voiceUrl }: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (voiceUrl) {
      const audioElement = new Audio(voiceUrl);
      setAudio(audioElement);
      
      // Clean up when component unmounts
      return () => {
        audioElement.pause();
        audioElement.src = '';
      };
    }
  }, [voiceUrl]);

  const togglePlayPause = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  if (!voiceUrl) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-md">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={togglePlayPause}
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        {isPlaying ? 'Playing audio...' : 'Listen to this article'}
      </span>
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause, Play, Download } from 'lucide-react';

interface ArticleAudioPlayerProps {
  voiceUrl?: string;
  voiceFileName?: string;
}

export function ArticleAudioPlayer({ voiceUrl, voiceFileName = 'voice-content.mp3' }: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (voiceUrl) {
      const audioElement = new Audio(voiceUrl);
      audioRef.current = audioElement;
      
      const updateProgress = () => {
        if (audioElement.duration) {
          setProgress((audioElement.currentTime / audioElement.duration) * 100);
        }
      };
      
      audioElement.addEventListener('timeupdate', updateProgress);
      audioElement.addEventListener('ended', () => setIsPlaying(false));
      
      // Clean up when component unmounts
      return () => {
        audioElement.pause();
        audioElement.removeEventListener('timeupdate', updateProgress);
        audioElement.removeEventListener('ended', () => setIsPlaying(false));
        audioElement.src = '';
      };
    }
  }, [voiceUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!voiceUrl) return;
    
    const a = document.createElement('a');
    a.href = voiceUrl;
    a.download = voiceFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!voiceUrl) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-secondary/20 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={togglePlayPause}
            className="h-8 w-8"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <span className="text-sm">
            {isPlaying ? 'Playing audio...' : 'Listen to this article'}
          </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDownload}
          className="h-8 w-8"
          title="Download audio file"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      {progress > 0 && (
        <div className="w-full bg-secondary/30 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

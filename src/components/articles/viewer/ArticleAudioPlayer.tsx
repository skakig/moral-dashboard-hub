
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
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!voiceUrl) return;
    
    console.log("ArticleAudioPlayer: Loading audio from URL:", voiceUrl);
    
    try {
      const audioElement = new Audio(voiceUrl);
      audioRef.current = audioElement;
      
      const updateProgress = () => {
        if (audioElement.duration) {
          setProgress((audioElement.currentTime / audioElement.duration) * 100);
        }
      };
      
      const handleError = (e: Event) => {
        console.error("Audio error:", e);
        setError("Failed to load audio file");
      };
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      
      audioElement.addEventListener('timeupdate', updateProgress);
      audioElement.addEventListener('error', handleError);
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handleEnded);
      
      // Clean up when component unmounts
      return () => {
        audioElement.pause();
        audioElement.removeEventListener('timeupdate', updateProgress);
        audioElement.removeEventListener('error', handleError);
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.src = '';
      };
    } catch (err) {
      console.error("Error initializing audio player:", err);
      setError("Failed to initialize audio player");
    }
  }, [voiceUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Create a play promise to catch any errors
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Error playing audio:", err);
            setError("Failed to play audio");
          });
        }
      }
    } catch (err) {
      console.error("Error in toggle play/pause:", err);
      setError("Failed to control audio");
    }
  };

  const handleDownload = () => {
    if (!voiceUrl) return;
    
    try {
      // For base64 data URLs
      if (voiceUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = voiceUrl;
        link.download = voiceFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For regular URLs
        const a = document.createElement('a');
        a.href = voiceUrl;
        a.download = voiceFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error downloading audio:", err);
      setError("Failed to download audio file");
    }
  };

  if (!voiceUrl) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-secondary/20 rounded-md">
      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}
      
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

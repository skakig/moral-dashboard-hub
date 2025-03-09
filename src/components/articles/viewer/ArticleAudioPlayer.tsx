
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause, Play, Download, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ArticleAudioPlayerProps {
  voiceUrl?: string;
  voiceFileName?: string;
  voiceSegments?: string; // JSON string containing multiple segments
  voiceBase64?: string; // Base64 audio data
}

export function ArticleAudioPlayer({ 
  voiceUrl, 
  voiceFileName = 'voice-content.mp3',
  voiceSegments,
  voiceBase64
}: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleSegments, setHasMultipleSegments] = useState(false);
  const [segments, setSegments] = useState<{audioUrl: string, fileName: string}[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentsRef = useRef<{audioUrl: string, fileName: string}[]>([]);

  // Initialize audio source from the available props
  useEffect(() => {
    try {
      // First priority: use voiceSegments if available
      if (voiceSegments) {
        try {
          const parsedSegments = JSON.parse(voiceSegments);
          if (Array.isArray(parsedSegments) && parsedSegments.length > 0) {
            segmentsRef.current = parsedSegments;
            setSegments(parsedSegments);
            setHasMultipleSegments(parsedSegments.length > 1);
            setAudioSource(parsedSegments[0].audioUrl);
            console.log(`ArticleAudioPlayer: Loaded ${parsedSegments.length} audio segments`);
            return;
          }
        } catch (err) {
          console.error("Error parsing voice segments:", err);
        }
      }
      
      // Second priority: use voiceUrl
      if (voiceUrl) {
        setAudioSource(voiceUrl);
        return;
      }
      
      // Third priority: use voiceBase64 to create a data URL
      if (voiceBase64) {
        const dataUrl = `data:audio/mp3;base64,${voiceBase64}`;
        setAudioSource(dataUrl);
        return;
      }
      
      // If none of the above worked, we have no audio source
      setError("No audio content available");
    } catch (err) {
      console.error("Error initializing audio player:", err);
      setError("Failed to initialize audio player");
    }
  }, [voiceUrl, voiceSegments, voiceBase64]);

  // Initialize audio player when we have an audio source
  useEffect(() => {
    if (!audioSource) return;
    
    console.log("ArticleAudioPlayer: Loading audio from URL:", audioSource);
    
    try {
      // Clean up any existing audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      const audioElement = new Audio(audioSource);
      audioRef.current = audioElement;
      
      const updateProgress = () => {
        if (audioElement.duration) {
          setProgress((audioElement.currentTime / audioElement.duration) * 100);
        }
      };
      
      const handleError = (e: Event) => {
        console.error("Audio error:", e);
        setError("Failed to load audio file");
        setIsPlaying(false);
      };
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      const handleEnded = () => {
        // If we have multiple segments, try to play the next one
        if (hasMultipleSegments && currentSegmentIndex < segments.length - 1) {
          setCurrentSegmentIndex(prev => prev + 1);
          const nextSegment = segments[currentSegmentIndex + 1];
          audioElement.src = nextSegment.audioUrl;
          audioElement.play().catch(err => {
            console.error("Error playing next segment:", err);
            setError("Failed to play next segment");
            setIsPlaying(false);
          });
        } else {
          setIsPlaying(false);
          setProgress(0);
        }
      };
      
      audioElement.addEventListener('timeupdate', updateProgress);
      audioElement.addEventListener('error', handleError);
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handleEnded);
      
      // Pre-load the audio to check for errors
      audioElement.load();
      
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
  }, [audioSource, hasMultipleSegments, segments, currentSegmentIndex]);

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
    if (!audioSource) {
      setError("No audio file available to download");
      return;
    }
    
    try {
      if (hasMultipleSegments) {
        // For multiple segments, we could offer a zip file in a real implementation
        // For now, just download the current segment with a notice
        if (segments.length > 1) {
          setError(`This audio has ${segments.length} parts. Downloading part ${currentSegmentIndex + 1}.`);
        }
        
        if (segments[currentSegmentIndex]?.audioUrl) {
          downloadFile(
            segments[currentSegmentIndex].audioUrl, 
            segments[currentSegmentIndex].fileName || `voice-part-${currentSegmentIndex + 1}.mp3`
          );
        }
      } else {
        downloadFile(audioSource, voiceFileName || 'voice-content.mp3');
      }
    } catch (err) {
      console.error("Error downloading audio:", err);
      setError("Failed to download audio file");
    }
  };
  
  const downloadFile = (url: string, filename: string) => {
    try {
      // For base64 data URLs
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For regular URLs
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error downloading audio:", err);
      setError("Failed to download audio file");
    }
  };

  if (!audioSource) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-secondary/20 rounded-md">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
            {hasMultipleSegments && ` (Part ${currentSegmentIndex + 1}/${segments.length})`}
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
      
      <Progress value={progress} className="h-1.5" />
      
      {hasMultipleSegments && (
        <div className="text-xs text-muted-foreground mt-1">
          This audio is split into {segments.length} parts due to length.
        </div>
      )}
    </div>
  );
}

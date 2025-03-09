
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Meme, 
  MemeFormData, 
  toMeme
} from '@/types/meme';

// Define structure for database response to avoid type confusion and infinite type recursion
interface MemeDbResponse {
  id: string;
  prompt: string;
  image_url: string;
  meme_text: string; // Contains JSON with topText and bottomText
  platform_tags?: string[];
  created_at: string;
  user_id?: string;
  engagement_score?: number;
}

export function useMemeOperations() {
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Add missing states for meme generator
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Generate meme image function
  const generateMemeImage = async (prompt: string, platform?: string): Promise<string | null> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Call your edge function or API to generate the image
      // This is a mock implementation - replace with actual implementation
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve('https://placehold.co/600x400/png');
        }, 1000);
      });
      
      toast.success('Meme image generated!');
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
      toast.error(`Error generating image: ${err.message}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Create or save a meme
  const saveMeme = async (memeData: MemeFormData): Promise<Meme | null> => {
    try {
      setIsSaving(true);
      setError(null);
      
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        toast.error('You must be logged in to save memes');
        return null;
      }
      
      // Prepare meme data for database
      const memeWithUser: MemeFormData = {
        ...memeData,
        user_id: userId
      };
      
      // Convert meme text to JSON string
      const memeTextJson = JSON.stringify({
        topText: memeWithUser.topText,
        bottomText: memeWithUser.bottomText
      });
      
      // Insert into database
      const { data, error } = await supabase
        .from('memes')
        .insert({
          image_url: memeWithUser.imageUrl || '',
          meme_text: memeTextJson,
          platform_tags: memeWithUser.platform 
            ? [memeWithUser.platform, ...(memeWithUser.hashtags || [])]
            : memeWithUser.hashtags,
          prompt: memeWithUser.prompt,
          user_id: memeWithUser.user_id,
          engagement_score: memeWithUser.engagement_score || 0
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Convert response back to frontend format using explicit type
      const dbResponse = data as MemeDbResponse;
      const newMeme = toMeme(dbResponse);
      
      // Add to local state
      setSavedMemes(prevMemes => [newMeme, ...prevMemes]);
      
      toast.success('Meme saved successfully!');
      return newMeme;
      
    } catch (err: any) {
      setError(err.message || 'Failed to save meme');
      toast.error(`Error saving meme: ${err.message}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fetch user's memes
  const fetchMemes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify authentication
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        setIsAuthenticated(false);
        setSavedMemes([]);
        return;
      }
      
      setIsAuthenticated(true);
      
      // Fetch memes for the current user
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        setSavedMemes([]);
        return;
      }
      
      // Use type assertion to ensure data has all required fields
      const typedData = data as MemeDbResponse[];
      
      // Now map with the properly typed data
      const formattedMemes = typedData.map(item => toMeme(item));
      
      setSavedMemes(formattedMemes);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load memes');
      console.error('Error fetching memes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Implement download meme function
  const downloadMeme = async (imageUrl: string, topText: string, bottomText: string) => {
    try {
      // Basic implementation - in a real app you might render the meme with text first
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `meme-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Meme downloaded!');
    } catch (err: any) {
      toast.error('Failed to download meme');
      console.error('Download error:', err);
    }
  };
  
  // Implement share meme function
  const shareMeme = async (
    platform: string, 
    imageUrl: string, 
    text: string, 
    options?: { redirectUrl?: string, tags?: string[] }
  ) => {
    try {
      // Mock implementation - would connect to share API in real app
      let shareUrl = '';
      
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(options?.redirectUrl || window.location.href)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(options?.redirectUrl || window.location.href)}`;
          break;
        default:
          toast.info(`Sharing to ${platform} not implemented yet`);
          return;
      }
      
      window.open(shareUrl, '_blank');
      toast.success(`Shared to ${platform}!`);
    } catch (err: any) {
      toast.error('Failed to share meme');
      console.error('Share error:', err);
    }
  };
  
  // Delete a meme
  const deleteMeme = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('memes')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setSavedMemes(prevMemes => prevMemes.filter(meme => meme.id !== id));
      
      toast.success('Meme deleted successfully');
      return true;
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete meme');
      toast.error(`Error deleting meme: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    savedMemes,
    isLoading,
    error,
    isAuthenticated,
    isGenerating,
    isSaving,
    saveMeme,
    fetchMemes,
    deleteMeme,
    generateMemeImage,
    downloadMeme,
    shareMeme
  };
}

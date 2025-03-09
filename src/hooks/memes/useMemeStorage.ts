
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme, MemeFormData } from '@/types/meme';
import { toast } from 'sonner';

export function useMemeStorage() {
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      const memeWithUser = {
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
      
      if (!data) {
        throw new Error('No data returned from insert operation');
      }
      
      // Manually construct a Meme object from the database response
      let newMeme: Meme = {
        id: data.id,
        prompt: data.prompt || "",
        imageUrl: data.image_url || "",
        topText: "",
        bottomText: "",
        platform: Array.isArray(data.platform_tags) ? data.platform_tags[0] : undefined,
        hashtags: Array.isArray(data.platform_tags) ? data.platform_tags.slice(1) : [],
        created_at: data.created_at,
        user_id: data.user_id,
        engagement_score: data.engagement_score || 0
      };
      
      // Parse the meme text JSON if present
      try {
        if (typeof data.meme_text === 'string') {
          const parsed = JSON.parse(data.meme_text);
          newMeme.topText = parsed?.topText || "";
          newMeme.bottomText = parsed?.bottomText || "";
        }
      } catch (e) {
        console.error("Error parsing meme text:", e);
      }
      
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
  const fetchMemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify authentication
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        setSavedMemes([]);
        return;
      }
      
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
      
      // Process data and transform to Meme array
      const memes: Meme[] = [];
      
      // Explicitly process each item
      for (const item of data) {
        const meme: Meme = {
          id: item.id,
          prompt: item.prompt || "",
          imageUrl: item.image_url || "",
          topText: "",
          bottomText: "",
          platform: Array.isArray(item.platform_tags) ? item.platform_tags[0] : undefined,
          hashtags: Array.isArray(item.platform_tags) ? item.platform_tags.slice(1) : [],
          created_at: item.created_at,
          user_id: item.user_id,
          engagement_score: item.engagement_score || 0
        };
        
        // Parse the meme text JSON if present
        try {
          if (typeof item.meme_text === 'string') {
            const parsed = JSON.parse(item.meme_text);
            meme.topText = parsed?.topText || "";
            meme.bottomText = parsed?.bottomText || "";
          }
        } catch (e) {
          console.error("Error parsing meme text for meme ID:", item.id, e);
        }
        
        memes.push(meme);
      }
      
      setSavedMemes(memes);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load memes');
      console.error('Error fetching memes:', err);
    } finally {
      setIsLoading(false);
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
    isSaving,
    saveMeme,
    fetchMemes,
    deleteMeme
  };
}

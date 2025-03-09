
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme, MemeFormData, toMeme } from '@/types/meme';
import { toast } from 'sonner';
import { MemeDbResponse } from './types';

export function useMemeDatabase() {
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
      
      // Use explicit type assertion to fix the deep type instantiation issue
      const typedData = data as MemeDbResponse[];
      
      // Use the toMeme function to map database response to frontend format
      const formattedMemes = typedData.map(dbMeme => toMeme(dbMeme));
      
      setSavedMemes(formattedMemes);
      
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

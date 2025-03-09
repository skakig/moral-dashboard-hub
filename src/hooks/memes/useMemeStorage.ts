
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme, MemeFormData, toMeme, toDbMemeRecord } from '@/types/meme';
import { toast } from 'sonner';

// Define a simpler structure for database response to avoid type recursion
interface SimpleMemeDbResponse {
  id: string;
  prompt: string;
  image_url: string;
  meme_text: string;
  platform_tags?: string[];
  created_at: string;
  user_id?: string;
  engagement_score?: number;
}

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
      const memeWithUser: MemeFormData = {
        ...memeData,
        user_id: userId
      };
      
      // Convert to database format
      const dbRecord = toDbMemeRecord(memeWithUser);
      
      // Insert into database
      const { data, error } = await supabase
        .from('memes')
        .insert(dbRecord)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Safe type conversion with explicit typing
      const dbResponse = data as SimpleMemeDbResponse;
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
      
      // Use explicit typing to avoid deep type instantiation
      const typedData = data as SimpleMemeDbResponse[];
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

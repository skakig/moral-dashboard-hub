
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Meme, MemeFormData, DbMeme, toMeme, toDbMeme } from '@/types/meme';

export function useMemeStorage() {
  const [isSaving, setIsSaving] = useState(false);
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Save meme to database
  const saveMeme = async (memeData: MemeFormData): Promise<Meme | null> => {
    if (!memeData.imageUrl) {
      toast.error('No image to save. Generate an image first.');
      return null;
    }
    
    setIsSaving(true);
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        toast.error('You must be logged in to save memes');
        return null;
      }
      
      // Prepare Meme object to convert to DB format
      const memeToSave: Partial<Meme> = {
        prompt: memeData.prompt,
        imageUrl: memeData.imageUrl,
        topText: memeData.topText,
        bottomText: memeData.bottomText,
        platform: memeData.platform,
        hashtags: memeData.hashtags || [],
        user_id: userId
      };
      
      // Convert to database format
      const dbMeme = toDbMeme(memeToSave);
      
      // Insert into database
      const { data, error } = await supabase
        .from('memes')
        .insert(dbMeme)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert DB response to frontend format
      const savedMeme = toMeme(data as DbMeme);
      
      toast.success('Meme saved successfully!');
      fetchMemes(); // Refresh the list
      return savedMeme;
    } catch (error: any) {
      console.error('Error saving meme:', error);
      toast.error('Failed to save meme. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch saved memes
  const fetchMemes = async () => {
    setIsLoading(true);
    
    try {
      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        toast.error('You must be logged in to view your memes');
        return;
      }
      
      // Fetch memes for current user
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Use a simple type assertion to avoid deep type inference
      const dbMemes = data as any[];
      const memes = dbMemes ? dbMemes.map(item => toMeme(item as DbMeme)) : [];
      
      setSavedMemes(memes);
    } catch (error) {
      console.error('Error fetching memes:', error);
      toast.error('Failed to load saved memes');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a meme
  const deleteMeme = async (id: string) => {
    try {
      const { error } = await supabase
        .from('memes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSavedMemes(prevMemes => prevMemes.filter(meme => meme.id !== id));
      toast.success('Meme deleted successfully');
    } catch (error) {
      console.error('Error deleting meme:', error);
      toast.error('Failed to delete meme');
    }
  };

  return {
    isSaving,
    isLoading,
    savedMemes,
    saveMeme,
    fetchMemes,
    deleteMeme
  };
}


import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Meme, MemeFormData } from '@/types/meme';

// Simple interface representing exactly what we expect from the database
interface DbMemeRecord {
  id: string;
  image_url: string;
  meme_text: string;
  platform_tags?: string[];
  prompt?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  engagement_score?: number;
}

export function useMemeStorage() {
  const [isSaving, setIsSaving] = useState(false);
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert DB record to frontend Meme format
  const toMeme = (dbMeme: DbMemeRecord): Meme => {
    // Parse meme_text if it's JSON (containing topText and bottomText)
    let topText = '';
    let bottomText = '';
    
    try {
      if (dbMeme.meme_text && dbMeme.meme_text.startsWith('{')) {
        const parsedText = JSON.parse(dbMeme.meme_text) as { topText?: string; bottomText?: string };
        topText = parsedText.topText || '';
        bottomText = parsedText.bottomText || '';
      } else {
        // If not JSON, use the whole text as topText
        topText = dbMeme.meme_text || '';
      }
    } catch (e) {
      // If parsing fails, use the text as is
      topText = dbMeme.meme_text || '';
    }
    
    return {
      id: dbMeme.id,
      prompt: dbMeme.prompt || '',
      imageUrl: dbMeme.image_url,
      topText: topText,
      bottomText: bottomText,
      platform: dbMeme.platform_tags && dbMeme.platform_tags.length > 0 ? dbMeme.platform_tags[0] : undefined,
      hashtags: dbMeme.platform_tags ? dbMeme.platform_tags.slice(1) : [],
      created_at: dbMeme.created_at,
      updated_at: dbMeme.updated_at,
      user_id: dbMeme.user_id,
      engagement_score: dbMeme.engagement_score
    };
  };

  // Save meme to database
  const saveMeme = async (memeData: MemeFormData): Promise<Meme | null> => {
    if (!memeData.imageUrl) {
      toast.error('No image to save. Generate an image first.');
      return null;
    }
    
    setIsSaving(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        toast.error('You must be logged in to save memes');
        return null;
      }
      
      // Format the data for the database - ensuring required fields are present
      const dbMemeData = {
        image_url: memeData.imageUrl || '',
        meme_text: JSON.stringify({
          topText: memeData.topText || '',
          bottomText: memeData.bottomText || ''
        }),
        platform_tags: memeData.platform ? 
          [memeData.platform, ...(memeData.hashtags || [])] : 
          memeData.hashtags || [],
        prompt: memeData.prompt || '',
        user_id: userId
      };
      
      console.log("Saving meme with data:", dbMemeData);
      
      // Insert into database with explicit field structure
      const { data, error } = await supabase
        .from('memes')
        .insert(dbMemeData)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error saving meme:', error);
        throw error;
      }
      
      // Convert DB response to frontend format using explicit typing
      const savedMeme = toMeme(data as DbMemeRecord);
      
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
      
      // If user is not logged in, don't show error, just return empty array
      if (!userId) {
        console.log('Not logged in, no memes to fetch');
        setSavedMemes([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch memes for current user
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert data to frontend format with explicit typing to avoid deep type issues
      const memes: Meme[] = [];
      
      if (data && Array.isArray(data)) {
        for (const item of data) {
          memes.push(toMeme(item as DbMemeRecord));
        }
      }
      
      setSavedMemes(memes);
    } catch (error) {
      console.error('Error fetching memes:', error);
      // Use a more user-friendly message that doesn't imply an error if not logged in
      toast.error('Could not load saved memes');
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


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Meme, 
  MemeFormData, 
  DbMemeRecord,
  toMeme, 
  toDbMemeRecord
} from '@/types/meme';

export function useMemeOperations() {
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Create or save a meme
  const saveMeme = async (memeData: MemeFormData): Promise<Meme | null> => {
    try {
      setIsLoading(true);
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
      const dbMeme = toDbMemeRecord(memeWithUser);
      
      // Insert into database
      const { data, error } = await supabase
        .from('memes')
        .insert({
          image_url: dbMeme.image_url,
          meme_text: dbMeme.meme_text,
          platform_tags: dbMeme.platform_tags,
          prompt: dbMeme.prompt,
          user_id: dbMeme.user_id,
          engagement_score: dbMeme.engagement_score || 0
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Convert response back to frontend format
      const newMeme = toMeme(data as DbMemeRecord);
      
      // Add to local state
      setSavedMemes(prevMemes => [newMeme, ...prevMemes]);
      
      toast.success('Meme saved successfully!');
      return newMeme;
      
    } catch (err: any) {
      setError(err.message || 'Failed to save meme');
      toast.error(`Error saving meme: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
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
      
      // Convert each record to frontend format and set state
      const formattedMemes = (data || []).map(
        (item: DbMemeRecord) => toMeme(item)
      );
      
      setSavedMemes(formattedMemes);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load memes');
      console.error('Error fetching memes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load memes on initial mount
  useEffect(() => {
    fetchMemes();
  }, [fetchMemes]);
  
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
    saveMeme,
    fetchMemes,
    deleteMeme
  };
}

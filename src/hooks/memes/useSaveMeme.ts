
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme, MemeFormData } from '@/types/meme';
import { toast } from 'sonner';
import { logError } from './utils/errorLogger';
import { dbRecordToMeme, memeFormToDbRecord } from './utils/memeMappers';

/**
 * Hook for saving a meme to the database
 */
export function useSaveMeme() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create or save a meme to the database
   */
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
      
      // Convert to database format and insert
      const dbRecord = memeFormToDbRecord(memeWithUser);
      
      // Insert into database
      const { data, error: saveError } = await supabase
        .from('memes')
        .insert(dbRecord)
        .select()
        .single();
      
      if (saveError) {
        throw saveError;
      }
      
      if (!data) {
        throw new Error('No data returned from insert operation');
      }
      
      // Convert database response to Meme type
      const newMeme = dbRecordToMeme(data);
      
      toast.success('Meme saved successfully!');
      return newMeme;
      
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save meme';
      setError(errorMsg);
      toast.error(`Error saving meme: ${errorMsg}`);
      logError('Error saving meme:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    error,
    saveMeme
  };
}


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logError } from './utils/errorLogger';

/**
 * Hook for deleting memes from the database
 */
export function useDeleteMeme() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Delete a meme by its ID
   */
  const deleteMeme = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { error: deleteError } = await supabase
        .from('memes')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        throw deleteError;
      }
      
      toast.success('Meme deleted successfully');
      return true;
      
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete meme';
      setError(errorMsg);
      toast.error(`Error deleting meme: ${errorMsg}`);
      logError('Error deleting meme:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    deleteMeme
  };
}


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme, MemeFormData } from '@/types/meme';
import { toast } from 'sonner';
import { MemeDbRecord } from './types';

export function useSaveMeme() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // Simply cast the data directly to prevent deep type instantiation
      const dbRecord = data as any;
      
      // Manually construct a Meme object from the database response
      let newMeme: Meme = {
        id: dbRecord.id,
        prompt: dbRecord.prompt || "",
        imageUrl: dbRecord.image_url || "",
        topText: "",
        bottomText: "",
        platform: Array.isArray(dbRecord.platform_tags) ? dbRecord.platform_tags[0] : undefined,
        hashtags: Array.isArray(dbRecord.platform_tags) ? dbRecord.platform_tags.slice(1) : [],
        created_at: dbRecord.created_at,
        user_id: dbRecord.user_id,
        engagement_score: dbRecord.engagement_score || 0
      };
      
      // Parse the meme text JSON if present
      try {
        if (typeof dbRecord.meme_text === 'string') {
          const parsed = JSON.parse(dbRecord.meme_text);
          newMeme.topText = parsed?.topText || "";
          newMeme.bottomText = parsed?.bottomText || "";
        }
      } catch (e) {
        console.error("Error parsing meme text:", e);
      }
      
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

  return {
    isSaving,
    error,
    saveMeme
  };
}


import { Meme, MemeFormData } from '@/types/meme';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Converts a database record to a frontend Meme model
 * Using explicit construction to avoid recursion
 */
export function dbRecordToMeme(dbRecord: any): Meme {
  try {
    // Parse meme text from JSON if possible
    let topText = "";
    let bottomText = "";
    
    if (typeof dbRecord.meme_text === 'string') {
      try {
        const parsed = JSON.parse(dbRecord.meme_text);
        topText = parsed?.topText || "";
        bottomText = parsed?.bottomText || "";
      } catch (e) {
        logError("Error parsing meme text:", e);
      }
    }
    
    // Explicitly construct the return object with only necessary properties
    const result: Meme = {
      id: dbRecord.id || "error",
      prompt: dbRecord.prompt || "",
      imageUrl: dbRecord.image_url || "",
      topText,
      bottomText,
      created_at: dbRecord.created_at || new Date().toISOString(),
      hashtags: []
    };
    
    // Only add optional fields if they exist
    if (dbRecord.user_id) {
      result.user_id = dbRecord.user_id;
    }
    
    if (typeof dbRecord.engagement_score === 'number') {
      result.engagement_score = dbRecord.engagement_score;
    }
    
    // Handle platform tags if they exist
    if (Array.isArray(dbRecord.platform_tags) && dbRecord.platform_tags.length > 0) {
      result.platform = dbRecord.platform_tags[0];
      result.hashtags = dbRecord.platform_tags.slice(1);
    }
    
    return result;
  } catch (e) {
    logError("Error transforming database record to meme:", e);
    // Return a minimal valid meme object
    return {
      id: "error",
      prompt: "",
      imageUrl: "",
      topText: "",
      bottomText: "",
      created_at: new Date().toISOString(),
      hashtags: []
    };
  }
}

/**
 * Converts a frontend MemeFormData to a database record structure
 * Returns a properly typed object for Supabase insert
 */
export function memeFormToDbRecord(memeData: MemeFormData): {
  image_url: string;
  meme_text: string;
  platform_tags?: string[];
  prompt?: string;
  user_id?: string;
  engagement_score?: number;
} {
  // Return an explicitly typed object matching Supabase's expected structure
  return {
    image_url: memeData.imageUrl || '',
    meme_text: JSON.stringify({
      topText: memeData.topText || '',
      bottomText: memeData.bottomText || ''
    }),
    platform_tags: memeData.platform 
      ? [memeData.platform, ...(memeData.hashtags || [])]
      : memeData.hashtags,
    prompt: memeData.prompt,
    user_id: memeData.user_id,
    engagement_score: memeData.engagement_score
  };
}

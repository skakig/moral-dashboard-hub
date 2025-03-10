
import { Meme, MemeFormData } from '@/types/meme';
import { logError } from './errorLogger';

/**
 * Converts a database record to a frontend Meme model
 * This simplifies type handling and avoids recursive type issues
 */
export function dbRecordToMeme(dbRecord: any): Meme {
  // Create a base meme object with default values
  const meme: Meme = {
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
      meme.topText = parsed?.topText || "";
      meme.bottomText = parsed?.bottomText || "";
    }
  } catch (e) {
    logError("Error parsing meme text for meme ID:", dbRecord.id, e);
  }
  
  return meme;
}

/**
 * Converts a frontend MemeFormData to a database record structure
 */
export function memeFormToDbRecord(memeData: MemeFormData): any {
  return {
    image_url: memeData.imageUrl || '',
    meme_text: JSON.stringify({
      topText: memeData.topText,
      bottomText: memeData.bottomText
    }),
    platform_tags: memeData.platform 
      ? [memeData.platform, ...(memeData.hashtags || [])]
      : memeData.hashtags,
    prompt: memeData.prompt,
    user_id: memeData.user_id,
    engagement_score: memeData.engagement_score || 0
  };
}

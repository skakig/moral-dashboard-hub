
import { Meme, MemeFormData } from '@/types/meme';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Converts a database record to a frontend Meme model
 * Using type assertions and explicit construction to avoid recursion
 */
export function dbRecordToMeme(dbRecord: any): Meme {
  try {
    // Use type assertion to help TypeScript understand the structure
    const record = dbRecord as unknown as {
      id: string;
      prompt?: string;
      image_url?: string;
      meme_text?: string;
      platform_tags?: string[];
      created_at: string;
      user_id?: string;
      engagement_score?: number;
    };
    
    // Parse meme text separately to avoid nested property access issues
    let topText = "";
    let bottomText = "";
    
    if (typeof record.meme_text === 'string') {
      try {
        const parsed = JSON.parse(record.meme_text);
        topText = parsed?.topText || "";
        bottomText = parsed?.bottomText || "";
      } catch (e) {
        logError("Error parsing meme text for meme ID:", record.id, e);
      }
    }
    
    // Explicitly construct the return object to avoid deep type instantiation
    const result: Meme = {
      id: record.id || "error",
      prompt: record.prompt || "",
      imageUrl: record.image_url || "",
      topText,
      bottomText,
      created_at: record.created_at || new Date().toISOString(),
      user_id: record.user_id,
      engagement_score: record.engagement_score || 0
    };
    
    // Handle optional properties explicitly
    if (Array.isArray(record.platform_tags) && record.platform_tags.length > 0) {
      result.platform = record.platform_tags[0];
      result.hashtags = record.platform_tags.slice(1);
    } else {
      result.hashtags = [];
    }
    
    return result;
  } catch (e) {
    logError("Error transforming database record to meme:", e);
    // Return a minimal valid meme object to prevent UI errors
    return {
      id: "error",
      prompt: "",
      imageUrl: "",
      topText: "",
      bottomText: "",
      created_at: new Date().toISOString()
    };
  }
}

/**
 * Converts a frontend MemeFormData to a database record structure
 * Using explicit typing to avoid recursion
 */
export function memeFormToDbRecord(memeData: MemeFormData): Record<string, any> {
  // Explicitly construct the database record
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

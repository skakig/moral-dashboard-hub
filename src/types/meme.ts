
// Frontend representation of a meme
export interface Meme {
  id: string;
  prompt: string;
  imageUrl: string;
  topText: string;
  bottomText: string;
  platform?: string;
  hashtags?: string[];
  created_at: string;
  updated_at?: string;
  user_id?: string;
  engagement_score?: number;
}

// Form data for creating/editing a meme
export interface MemeFormData {
  prompt: string;
  topText: string;
  bottomText: string;
  imageUrl?: string;
  platform?: string;
  hashtags?: string[];
  user_id?: string;
  engagement_score?: number;
}

// Database representation of a meme for safer type handling
export interface DbMemeRecord {
  id: string;
  prompt: string;
  image_url: string;
  meme_text: string; // Contains JSON with topText and bottomText
  platform_tags?: string[];
  created_at: string;
  user_id?: string;
  engagement_score?: number;
}

// For social media sharing
export interface SharingOptions {
  redirectUrl?: string;
  additionalTags?: string[];
  message?: string;
}

// Mappers to convert between DB and frontend formats
export const toMeme = (dbMeme: DbMemeRecord): Meme => {
  let topText = "";
  let bottomText = "";
  
  try {
    // Parse the JSON string containing text data with error handling
    if (typeof dbMeme.meme_text === 'string') {
      const memeText = JSON.parse(dbMeme.meme_text);
      topText = memeText?.topText || "";
      bottomText = memeText?.bottomText || "";
    }
  } catch (e) {
    console.error("Error parsing meme text:", e);
  }
  
  return {
    id: dbMeme.id,
    prompt: dbMeme.prompt || "",
    imageUrl: dbMeme.image_url || "",
    topText,
    bottomText,
    platform: dbMeme.platform_tags?.[0],
    hashtags: dbMeme.platform_tags?.slice(1),
    created_at: dbMeme.created_at,
    user_id: dbMeme.user_id,
    engagement_score: dbMeme.engagement_score || 0
  };
};

export const toDbMemeRecord = (meme: MemeFormData): Omit<DbMemeRecord, 'id' | 'created_at'> => {
  return {
    prompt: meme.prompt,
    image_url: meme.imageUrl || '',
    meme_text: JSON.stringify({
      topText: meme.topText,
      bottomText: meme.bottomText
    }),
    platform_tags: meme.platform 
      ? [meme.platform, ...(meme.hashtags || [])]
      : meme.hashtags,
    user_id: meme.user_id,
    engagement_score: meme.engagement_score || 0
  };
};

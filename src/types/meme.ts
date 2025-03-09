
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
}

// Database representation of a meme
export interface DbMeme {
  id: string;
  image_url: string;
  meme_text: string;  // Combined text or JSON string of top/bottom text
  platform_tags?: string[];
  prompt?: string;
  created_at: string;
  updated_at?: string;
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
export const toMeme = (dbMeme: DbMeme): Meme => {
  // Parse meme_text if it's JSON (containing topText and bottomText)
  let topText = '';
  let bottomText = '';
  
  try {
    if (dbMeme.meme_text && dbMeme.meme_text.startsWith('{')) {
      const parsedText = JSON.parse(dbMeme.meme_text);
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

export const toDbMeme = (meme: Omit<Meme, 'id' | 'created_at' | 'updated_at'>): Omit<DbMeme, 'id' | 'created_at' | 'updated_at'> => {
  // Combine topText and bottomText into a JSON string
  const memeText = JSON.stringify({
    topText: meme.topText,
    bottomText: meme.bottomText
  });
  
  // Combine platform and hashtags into platform_tags
  const platformTags = meme.platform ? [meme.platform, ...(meme.hashtags || [])] : meme.hashtags || [];
  
  return {
    image_url: meme.imageUrl,
    meme_text: memeText,
    platform_tags: platformTags,
    prompt: meme.prompt,
    user_id: meme.user_id,
    engagement_score: meme.engagement_score
  };
};

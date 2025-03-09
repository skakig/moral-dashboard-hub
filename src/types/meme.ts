
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
}

export interface MemeFormData {
  prompt: string;
  topText: string;
  bottomText: string;
  imageUrl?: string;
  platform?: string;
  hashtags?: string[];
}

export interface SharingOptions {
  redirectUrl?: string;
  additionalTags?: string[];
  message?: string;
}

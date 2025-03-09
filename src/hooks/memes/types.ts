
import { Meme, MemeFormData } from '@/types/meme';

// Define structure for database response to avoid type confusion and infinite type recursion
export interface MemeDbResponse {
  id: string;
  prompt: string;
  image_url: string;
  meme_text: string; // Contains JSON with topText and bottomText
  platform_tags?: string[];
  created_at: string;
  user_id?: string;
  engagement_score?: number;
}

export interface UseMemeOperationsReturn {
  savedMemes: Meme[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  saveMeme: (memeData: MemeFormData) => Promise<Meme | null>;
  fetchMemes: () => Promise<void>;
  deleteMeme: (id: string) => Promise<boolean>;
  generateMemeImage: (prompt: string, platform?: string) => Promise<string | null>;
  downloadMeme: (imageUrl: string, topText: string, bottomText: string) => void;
  shareMeme: (
    platform: string, 
    imageUrl: string, 
    text: string, 
    options?: { redirectUrl?: string, tags?: string[] }
  ) => void;
}

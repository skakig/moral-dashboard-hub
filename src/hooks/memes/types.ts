
import { Meme, MemeFormData } from '@/types/meme';

// Simplified interface for database response to avoid type recursion issues
export interface MemeDbRecord {
  id: string;
  image_url: string;
  meme_text: string;
  platform_tags?: string[];
  created_at: string;
  user_id?: string;
  prompt?: string;
  engagement_score?: number;
}

// Type for useMemeOperations return value
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

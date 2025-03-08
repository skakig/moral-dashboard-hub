
export interface Meme {
  id: string;
  meme_text: string;
  image_url: string;
  platform_tags: string[];
  engagement_score: number;
  created_at: string;
}

export interface AIVideo {
  id: string;
  video_url: string;
  script_text: string;
  voice_style: string;
  platform_targeting: string[];
  created_at: string;
}

// Assessment related types for cross-component consistency
export interface MoralLevel {
  id: number;
  level: number;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string | null;
  category: Category;
  level: MoralLevel;
  questions_count: number;
  time_limit_seconds: number;
  sequential_logic_enabled: boolean;
  created_at: string;
  updated_at: string;
  status: string;
  is_active: boolean;
}

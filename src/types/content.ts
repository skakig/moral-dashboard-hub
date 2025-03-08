
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


export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  status: "draft" | "scheduled" | "published";
  seo_keywords: string[];
  meta_description: string | null;
  featured_image: string | null;
  publish_date: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  engagement_score: number;
  excerpt?: string;
  voice_url?: string;
  voice_generated?: boolean;
  voice_file_name?: string;
  voice_base64?: string;
  moral_level?: number;
  author_id?: string;
}

export interface ArticleSocialPost {
  id: string;
  article_id: string;
  platform: string;
  content: string;
  image_url: string | null;
  post_url: string | null;
  scheduled_for: string | null;
  posted_at: string | null;
  status: "draft" | "scheduled" | "posted";
  engagement_metrics?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ContentTheme {
  id: string;
  name: string;
  description: string | null;
  keywords: string[];
  target_audience: string | null;
  recommended_frequency: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticleUpdateInput {
  id: string;
  title?: string;
  content?: string;
  seo_keywords?: string[];
  meta_description?: string | null;
  featured_image?: string | null;
  excerpt?: string;
  voice_url?: string;
  voice_generated?: boolean;
  voice_file_name?: string;
  voice_base64?: string;
  moral_level?: number | string;
  status?: "draft" | "scheduled" | "published";
  publish_date?: string | null;
  
  // Support for camelCase versions for form data
  seoKeywords?: string[] | string;
  metaDescription?: string | null;
  featuredImage?: string | null;
  voiceUrl?: string;
  voiceGenerated?: boolean;
  voiceFileName?: string;
  voiceBase64?: string;
  moralLevel?: number | string;
  
  // Allow category for create operation
  category?: string;
}


export interface GenerationParams {
  theme: string;
  keywords?: string[];
  contentType: string;
  moralLevel: number;
  platform: string;
  contentLength: string;
  tone?: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  keywords?: string[];
}

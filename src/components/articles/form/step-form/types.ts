
import { z } from "zod";

// The form schema
export const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().optional(),
  contentType: z.string().optional(),
  platform: z.string().optional(),
  contentLength: z.string().optional(),
  tone: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  voiceUrl: z.string().optional(),
  voiceGenerated: z.boolean().optional().default(false),
  moralLevel: z.string().or(z.number()).optional().default(5),
  theme: z.string().optional(),
  voiceFileName: z.string().optional(),
  voiceBase64: z.string().optional(),
  voiceSegments: z.string().optional(), // Add voiceSegments field
  // Internal fields for auto-generation
  _autoGenerate: z.boolean().optional(),
  _autoGenerateOptions: z.any().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

export type Step = {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isRequired?: boolean;
};

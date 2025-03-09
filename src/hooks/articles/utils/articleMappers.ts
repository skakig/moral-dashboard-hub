
import { ArticleFormValues } from "@/components/articles/form";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/integrations/supabase/client";

/**
 * Maps form values to database fields for article storage
 * @param formValues - Values from the article form
 * @returns Object with DB-compatible field names and values
 */
export const mapFormToDbArticle = (formValues: ArticleFormValues) => {
  // Extract keywords from comma-separated string
  const seoKeywords = formValues.seoKeywords 
    ? formValues.seoKeywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];
    
  // Log what we're saving to help debug
  console.log("Saving article with data:", {
    title: formValues.title,
    contentLength: formValues.content?.length,
    hasVoiceUrl: Boolean(formValues.voiceUrl),
    voiceGenerated: formValues.voiceGenerated,
    voiceFileName: formValues.voiceFileName,
    hasVoiceBase64: Boolean(formValues.voiceBase64),
    platform: formValues.platform,
    moralLevel: formValues.moralLevel
  });
  
  // Map the form fields to database fields - only include fields that exist in the DB schema
  return {
    title: formValues.title,
    content: formValues.content || '',
    meta_description: formValues.metaDescription || null,
    featured_image: formValues.featuredImage || null,
    seo_keywords: seoKeywords,
    status: 'draft', // Default to draft
    category: formValues.platform || 'General', // Use platform as category
    voice_url: formValues.voiceUrl || null,
    voice_generated: formValues.voiceGenerated || false,
    voice_file_name: formValues.voiceFileName || null, 
    voice_base64: formValues.voiceBase64 || null,
    moral_level: formValues.moralLevel ? Number(formValues.moralLevel) : 5
    // Note: We've removed the excerpt field as it doesn't exist in the database schema
  };
};

/**
 * Maps database article to form values
 * @param article - Article from database
 * @returns Form-compatible values
 */
export const mapDbArticleToForm = (article: any): ArticleFormValues => {
  return {
    title: article.title || "",
    content: article.content || "",
    metaDescription: article.meta_description || "",
    featuredImage: article.featured_image || "",
    seoKeywords: Array.isArray(article.seo_keywords) ? article.seo_keywords.join(', ') : "",
    voiceUrl: article.voice_url || "",
    voiceGenerated: article.voice_generated || false,
    voiceFileName: article.voice_file_name || "",
    voiceBase64: article.voice_base64 || "",
    moralLevel: article.moral_level || 5,
    platform: article.category || "",
    contentType: "",  // Defaults to empty as it's not stored in DB
    contentLength: "medium", // Default
    tone: "informative", // Default
    theme: "", // Default
    excerpt: "" // Default empty string for compatibility
  };
};

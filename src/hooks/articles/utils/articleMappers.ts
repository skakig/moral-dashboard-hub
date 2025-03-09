
import { ArticleFormValues } from "@/components/articles/form";

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
  console.log("Saving article with voice data:", {
    voiceUrl: formValues.voiceUrl,
    voiceGenerated: formValues.voiceGenerated,
    voiceFileName: formValues.voiceFileName,
    hasVoiceBase64: Boolean(formValues.voiceBase64)
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
    moral_level: formValues.moralLevel ? Number(formValues.moralLevel) : 5,
    excerpt: formValues.excerpt || null
  };
};

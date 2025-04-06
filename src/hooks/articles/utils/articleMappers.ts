
import { ArticleFormValues } from "@/components/articles/form";

/**
 * Maps form values to database fields for article storage
 * @param formValues - Values from the article form
 * @returns Object with DB-compatible field names and values
 */
export const mapFormToDbArticle = (formValues: Partial<ArticleFormValues> & { id?: string, publish_date?: string }) => {
  // Extract keywords from comma-separated string if present
  let seoKeywords: string[] = [];
  
  if (Array.isArray(formValues.seoKeywords)) {
    seoKeywords = formValues.seoKeywords.filter(Boolean);
  } else if (typeof formValues.seoKeywords === 'string' && formValues.seoKeywords.trim() !== '') {
    seoKeywords = formValues.seoKeywords.split(',').map(k => k.trim()).filter(Boolean);
  }
    
  // Log what we're saving to help debug
  console.log("Mapping article form data:", {
    id: formValues.id,
    title: formValues.title,
    voiceUrl: formValues.voiceUrl,
    voiceGenerated: formValues.voiceGenerated,
    voiceFileName: formValues.voiceFileName,
    hasVoiceBase64: Boolean(formValues.voiceBase64),
    publishDate: formValues.publish_date,
    keywordsCount: seoKeywords.length,
    moralLevel: formValues.moralLevel
  });
  
  // Create the article object, handling both partial and complete updates
  const article: any = {};
  
  // Only include fields that are present in the formValues
  if (formValues.title !== undefined) article.title = formValues.title;
  if (formValues.content !== undefined) article.content = formValues.content || '';
  if (formValues.metaDescription !== undefined) article.meta_description = formValues.metaDescription || null;
  if (formValues.featuredImage !== undefined) article.featured_image = formValues.featuredImage || null;
  article.seo_keywords = seoKeywords; // Always set keywords, even if empty array
  if (formValues.platform !== undefined) article.category = formValues.platform || 'General';
  if (formValues.voiceUrl !== undefined) article.voice_url = formValues.voiceUrl || null;
  if (formValues.voiceGenerated !== undefined) article.voice_generated = formValues.voiceGenerated || false;
  if (formValues.voiceFileName !== undefined) article.voice_file_name = formValues.voiceFileName || null;
  if (formValues.voiceBase64 !== undefined) article.voice_base64 = formValues.voiceBase64 || null;
  
  if (formValues.moralLevel !== undefined) {
    let moralLevel: number;
    if (typeof formValues.moralLevel === 'string') {
      moralLevel = parseInt(formValues.moralLevel, 10) || 5;
    } else {
      moralLevel = formValues.moralLevel || 5;
    }
    article.moral_level = moralLevel;
  }
  
  // Set publish_date if provided (for publishing an article)
  if (formValues.publish_date !== undefined) {
    article.publish_date = formValues.publish_date;
    article.status = 'published'; // When a publish_date is set, we also update the status
  }
  
  return article;
};

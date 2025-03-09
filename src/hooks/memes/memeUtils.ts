
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Generate meme image function - connects to OpenAI DALL-E API through edge function
export const generateMemeImage = async (prompt: string, platform?: string): Promise<string | null> => {
  try {
    // Get current user session to ensure user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      toast.error('You must be logged in to generate memes');
      return null;
    }
    
    // Call the edge function for image generation
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        prompt,
        platform: platform || 'twitter',
        width: 1024,
        height: 1024
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data?.image) {
      throw new Error('No image was generated');
    }
    
    toast.success('Meme image generated!');
    return data.image;
  } catch (err: any) {
    toast.error(`Error generating image: ${err.message}`);
    console.error('Image generation error:', err);
    return null;
  }
};

// Download meme function
export const downloadMeme = (imageUrl: string, topText: string, bottomText: string): void => {
  try {
    // For now, simply download the image. In a future version, render the image with text overlay
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `meme-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Meme downloaded!');
  } catch (err: any) {
    toast.error('Failed to download meme');
    console.error('Download error:', err);
  }
};

// Share meme function
export const shareMeme = (
  platform: string, 
  imageUrl: string, 
  text: string, 
  options?: { redirectUrl?: string, tags?: string[] }
): void => {
  try {
    let shareUrl = '';
    
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(options?.redirectUrl || window.location.href)}`;
        if (options?.tags && options.tags.length > 0) {
          shareUrl += `&hashtags=${options.tags.join(',')}`;
        }
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(options?.redirectUrl || window.location.href)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(options?.redirectUrl || window.location.href)}`;
        break;
      default:
        toast.info(`Sharing to ${platform} not implemented yet`);
        return;
    }
    
    window.open(shareUrl, '_blank');
    toast.success(`Shared to ${platform}!`);
  } catch (err: any) {
    toast.error('Failed to share meme');
    console.error('Share error:', err);
  }
};

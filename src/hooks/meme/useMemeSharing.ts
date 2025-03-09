
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useMemeSharing() {
  // Generate sharing URLs based on platform
  const generateSharingUrl = (imageUrl: string, text: string, platform: string, options?: { redirectUrl?: string, tags?: string[] }) => {
    const redirectUrl = options?.redirectUrl || 'https://themh.io';
    const hashtags = options?.tags?.join(',') || 'TheMoralHierarchy,TMH';
    
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(redirectUrl)}&hashtags=${encodeURIComponent(hashtags.replace(/#/g, ''))}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(redirectUrl)}&quote=${encodeURIComponent(text)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(redirectUrl)}&summary=${encodeURIComponent(text)}`;
      case 'pinterest':
        return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(redirectUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(text)}`;
      default:
        return null;
    }
  };

  // Share meme on social media
  const shareMeme = async (platform: string, imageUrl: string, text: string, options?: { redirectUrl?: string, tags?: string[] }) => {
    try {
      // Fetch sharing options from Supabase Edge Function
      const { data: sharingOptions, error } = await supabase.functions.invoke('get-sharing-options', {
        body: { platform: platform.toLowerCase() }
      });
      
      if (error) {
        console.error('Error fetching sharing options:', error);
        // Continue with default options
      }
      
      // Merge default options with any from the database
      const redirectUrl = sharingOptions?.redirectUrl || options?.redirectUrl || 'https://themh.io';
      const tags = sharingOptions?.additionalTags || options?.tags || ['TheMoralHierarchy', 'TMH'];
      const message = sharingOptions?.message ? `${sharingOptions.message} ${text}` : text;
      
      // Generate sharing URL
      const sharingUrl = generateSharingUrl(imageUrl, message, platform, { 
        redirectUrl, 
        tags 
      });
      
      if (sharingUrl) {
        window.open(sharingUrl, '_blank', 'width=600,height=400');
      } else {
        toast.error(`Sharing on ${platform} is not supported yet`);
      }
    } catch (error) {
      console.error('Error sharing meme:', error);
      toast.error('Failed to share meme');
      
      // Fallback to default sharing
      const sharingUrl = generateSharingUrl(imageUrl, text, platform, options);
      if (sharingUrl) {
        window.open(sharingUrl, '_blank', 'width=600,height=400');
      }
    }
  };

  return {
    shareMeme
  };
}

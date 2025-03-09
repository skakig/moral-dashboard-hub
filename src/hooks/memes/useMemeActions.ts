
import { toast } from 'sonner';

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

export function useMemeActions() {
  return {
    downloadMeme,
    shareMeme
  };
}

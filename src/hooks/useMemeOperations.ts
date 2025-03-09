
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';
import { Meme, MemeFormData, DbMeme, toMeme, toDbMeme } from '@/types/meme';
import { generateRandomId } from '@/lib/utils';

export function useMemeOperations() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate a meme image based on prompt
  const generateMemeImage = async (prompt: string, platform?: string): Promise<string | null> => {
    setIsGenerating(true);
    
    try {
      // Define dimensions based on platform
      let width = 1024;
      let height = 1024;
      
      // Adjust dimensions based on platform
      if (platform) {
        switch (platform.toLowerCase()) {
          case 'instagram':
            width = 1080;
            height = 1080;
            break;
          case 'facebook':
            width = 1200;
            height = 630;
            break;
          case 'twitter':
          case 'x':
            width = 1200;
            height = 675;
            break;
          case 'tiktok':
            width = 1080;
            height = 1920;
            break;
          default:
            width = 1024;
            height = 1024;
        }
      }
      
      const result = await EdgeFunctionService.generateImage(prompt, platform, width, height);
      
      if (!result || !result.image) {
        throw new Error('No image was generated');
      }
      
      return result.image;
    } catch (error) {
      console.error('Error generating meme image:', error);
      toast.error('Failed to generate image. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Save meme to database
  const saveMeme = async (memeData: MemeFormData): Promise<Meme | null> => {
    if (!memeData.imageUrl) {
      toast.error('No image to save. Generate an image first.');
      return null;
    }
    
    setIsSaving(true);
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Convert to database format
      const dbMeme = {
        prompt: memeData.prompt,
        image_url: memeData.imageUrl,
        top_text: memeData.topText,
        bottom_text: memeData.bottomText,
        platform: memeData.platform,
        hashtags: memeData.hashtags || [],
        user_id: userId
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('memes')
        .insert(dbMeme)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert DB response to frontend format
      const savedMeme = toMeme(data as DbMeme);
      
      toast.success('Meme saved successfully!');
      fetchMemes(); // Refresh the list
      return savedMeme;
    } catch (error: any) {
      console.error('Error saving meme:', error);
      toast.error('Failed to save meme. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch saved memes
  const fetchMemes = async () => {
    setIsLoading(true);
    
    try {
      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      // Fetch memes for current user
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert DB data to frontend format
      const memes = (data as DbMeme[]).map(dbMeme => toMeme(dbMeme));
      setSavedMemes(memes);
    } catch (error) {
      console.error('Error fetching memes:', error);
      toast.error('Failed to load saved memes');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a meme
  const deleteMeme = async (id: string) => {
    try {
      const { error } = await supabase
        .from('memes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSavedMemes(prevMemes => prevMemes.filter(meme => meme.id !== id));
      toast.success('Meme deleted successfully');
    } catch (error) {
      console.error('Error deleting meme:', error);
      toast.error('Failed to delete meme');
    }
  };

  // Download meme as image
  const downloadMeme = async (imageUrl: string, topText: string, bottomText: string) => {
    try {
      // For data URLs, we can use them directly
      if (imageUrl.startsWith('data:')) {
        // Create an image element to draw on canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Create a canvas to draw the meme with text
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            toast.error('Could not create image context');
            return;
          }
          
          // Draw the background image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Style for the text
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 4;
          ctx.textAlign = 'center';
          
          // Font size based on canvas size
          const fontSize = Math.max(Math.floor(canvas.width * 0.06), 24);
          ctx.font = `bold ${fontSize}px Impact, sans-serif`;
          
          // Draw top text
          if (topText) {
            ctx.textBaseline = 'top';
            ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20, canvas.width - 40);
            ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20, canvas.width - 40);
          }
          
          // Draw bottom text
          if (bottomText) {
            ctx.textBaseline = 'bottom';
            ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20, canvas.width - 40);
            ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20, canvas.width - 40);
          }
          
          // Export canvas as image and trigger download
          const link = document.createElement('a');
          link.download = `meme-${generateRandomId()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        
        img.src = imageUrl;
      } else {
        // For regular URLs, fetch first to handle CORS
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `meme-${generateRandomId()}.png`;
        link.click();
        
        URL.revokeObjectURL(objectUrl);
      }
      
      toast.success('Meme downloaded successfully');
    } catch (error) {
      console.error('Error downloading meme:', error);
      toast.error('Failed to download meme');
    }
  };

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
    isGenerating,
    isSaving,
    isLoading,
    savedMemes,
    generateMemeImage,
    saveMeme,
    fetchMemes,
    deleteMeme,
    downloadMeme,
    shareMeme
  };
}

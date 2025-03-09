
import { toast } from 'sonner';
import { generateRandomId } from '@/lib/utils';

export function useMemeDownload() {
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

  return {
    downloadMeme
  };
}

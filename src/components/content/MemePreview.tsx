
import React from "react";

interface MemePreviewProps {
  imageUrl: string;
  topText?: string;
  bottomText?: string;
}

export function MemePreview({ imageUrl, topText, bottomText }: MemePreviewProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <img 
        src={imageUrl} 
        alt="Meme Preview" 
        className="w-full h-auto rounded-lg shadow-md"
      />
      
      {topText && (
        <div className="absolute top-4 left-0 right-0 text-center">
          <p className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {topText}
          </p>
        </div>
      )}
      
      {bottomText && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {bottomText}
          </p>
        </div>
      )}
    </div>
  );
}

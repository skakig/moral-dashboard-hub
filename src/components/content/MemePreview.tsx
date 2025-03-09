
import React, { useEffect, useRef } from "react";

interface MemePreviewProps {
  imageUrl: string;
  topText?: string;
  bottomText?: string;
}

export function MemePreview({ imageUrl, topText, bottomText }: MemePreviewProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Handle image loading errors
    if (imgRef.current) {
      imgRef.current.onerror = () => {
        console.error("Error loading image:", imageUrl);
        if (imgRef.current) {
          imgRef.current.src = "/placeholder.svg";
        }
      };
    }
  }, [imageUrl]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <img 
        ref={imgRef}
        src={imageUrl} 
        alt="Meme Preview" 
        className="w-full h-auto rounded-lg shadow-md"
        crossOrigin="anonymous" // Important for canvas operations
      />
      
      {topText && (
        <div className="absolute top-4 left-0 right-0 text-center px-4">
          <p className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
            {topText}
          </p>
        </div>
      )}
      
      {bottomText && (
        <div className="absolute bottom-4 left-0 right-0 text-center px-4">
          <p className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
            {bottomText}
          </p>
        </div>
      )}
    </div>
  );
}

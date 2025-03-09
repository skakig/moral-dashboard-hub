
import React, { useEffect, useRef, useState } from "react";

interface MemePreviewProps {
  imageUrl: string;
  topText?: string;
  bottomText?: string;
}

export function MemePreview({ imageUrl, topText, bottomText }: MemePreviewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when imageUrl changes
    setHasError(false);
    
    // Handle image loading errors
    if (imgRef.current) {
      imgRef.current.onerror = () => {
        console.error("Error loading image:", imageUrl);
        setHasError(true);
        if (imgRef.current) {
          imgRef.current.src = "/placeholder.svg";
        }
      };
    }
  }, [imageUrl]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {hasError ? (
        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-red-500">Error loading image</p>
          <img 
            src="/placeholder.svg" 
            alt="Placeholder" 
            className="w-full h-auto rounded-lg mt-2"
          />
        </div>
      ) : (
        <>
          <img 
            ref={imgRef}
            src={imageUrl} 
            alt="Meme Preview" 
            className="w-full h-auto rounded-lg shadow-md"
            crossOrigin="anonymous" // Important for canvas operations
          />
          
          {topText && (
            <div className="absolute top-4 left-0 right-0 text-center px-4">
              <p className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" style={{ fontFamily: 'Impact, sans-serif' }}>
                {topText}
              </p>
            </div>
          )}
          
          {bottomText && (
            <div className="absolute bottom-4 left-0 right-0 text-center px-4">
              <p className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" style={{ fontFamily: 'Impact, sans-serif' }}>
                {bottomText}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

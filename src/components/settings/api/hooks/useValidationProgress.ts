
import { useState, useEffect } from 'react';

/**
 * Hook to manage validation progress animation
 */
export function useValidationProgress() {
  const [loading, setLoading] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);

  useEffect(() => {
    // Reset progress when not loading
    if (!loading) {
      setValidationProgress(0);
    }
  }, [loading]);

  useEffect(() => {
    // Simulate progress during validation
    let interval: number | null = null;
    
    if (loading) {
      interval = setInterval(() => {
        setValidationProgress(prev => {
          const newProgress = prev + (5 * Math.random());
          return newProgress < 95 ? newProgress : 95;
        });
      }, 150) as unknown as number;
    } else if (validationProgress > 0) {
      // When done loading, complete the progress bar
      setValidationProgress(100);
      // Reset after animation completes
      const timeout = setTimeout(() => {
        setValidationProgress(0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, validationProgress]);

  return {
    loading,
    setLoading,
    validationProgress,
    setValidationProgress
  };
}

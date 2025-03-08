
import { useState, useEffect } from 'react';

export function useValidationProgress() {
  const [loading, setLoading] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  
  // Auto-increment progress for better UX during validation
  useEffect(() => {
    let interval: number;
    
    if (loading) {
      setValidationProgress(10); // Start at 10%
      
      interval = window.setInterval(() => {
        setValidationProgress((prev) => {
          // Simulate progress up to 90% (the final 10% will be set when the operation completes)
          const increment = Math.random() * 10;
          const nextValue = prev + increment;
          return nextValue < 90 ? nextValue : 90;
        });
      }, 800);
    } else {
      // When loading is done, either reset to 0 or complete to 100
      setValidationProgress((prev) => prev > 0 ? 100 : 0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);
  
  return {
    loading,
    setLoading,
    validationProgress
  };
}

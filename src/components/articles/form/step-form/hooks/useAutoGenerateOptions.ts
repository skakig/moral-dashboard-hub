
import { useState } from "react";

export interface AutoGenerateOptions {
  voice: boolean;
  image: boolean;
}

export function useAutoGenerateOptions() {
  const [autoGenerateContent, setAutoGenerateContent] = useState(true);
  const [autoGenerateOptions, setAutoGenerateOptions] = useState<AutoGenerateOptions>({
    voice: false,
    image: false,
  });

  const updateAutoGenerateOptions = (options: Partial<AutoGenerateOptions>) => {
    setAutoGenerateOptions(prev => ({
      ...prev,
      ...options
    }));
  };

  return {
    autoGenerateContent,
    setAutoGenerateContent,
    autoGenerateOptions,
    setAutoGenerateOptions,
    updateAutoGenerateOptions
  };
}

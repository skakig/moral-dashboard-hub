
import { useState, useEffect } from 'react';
import { API_CATEGORIES, needsBaseUrlForService, getTestKeyForService } from './constants';

interface UseServiceSelectionProps {
  category: string;
}

export function useServiceSelection({ category }: UseServiceSelectionProps) {
  const [serviceName, setServiceName] = useState<string>('');
  const [suggestedServices, setSuggestedServices] = useState<string[]>([]);
  
  // Determine if the selected service needs a base URL
  const needsBaseUrl = needsBaseUrlForService(serviceName);

  // Get test key for demo purposes
  const getTestKey = () => getTestKeyForService(serviceName);

  // Update suggested services when category changes
  useEffect(() => {
    if (category && API_CATEGORIES[category as keyof typeof API_CATEGORIES]) {
      setSuggestedServices(API_CATEGORIES[category as keyof typeof API_CATEGORIES]);
    } else {
      // Default to showing all services flattened if category is not recognized
      const allServices = Object.values(API_CATEGORIES).flat();
      setSuggestedServices(allServices);
    }
  }, [category]);

  return {
    serviceName,
    setServiceName,
    suggestedServices,
    needsBaseUrl,
    getTestKey
  };
}

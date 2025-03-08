
import { useState, useEffect } from 'react';
import { needsBaseUrlForService, getTestKeyForService, API_CATEGORIES } from '../constants';
import { getServicesForCategory } from '../utils/serviceCategories';

interface UseServiceSelectionProps {
  category: string;
}

export function useServiceSelection({ category }: UseServiceSelectionProps) {
  const [serviceName, setServiceName] = useState<string>('');
  const [suggestedServices, setSuggestedServices] = useState<string[]>([]);
  
  useEffect(() => {
    if (category) {
      const services = getServicesForCategory(category);
      setSuggestedServices(services);
      
      // Set a default service if available
      if (services.length > 0 && !serviceName) {
        setServiceName(services[0]);
      }
    }
  }, [category]);
  
  const needsBaseUrl = needsBaseUrlForService(serviceName);
  const getTestKey = getTestKeyForService;
  
  return {
    serviceName,
    setServiceName,
    needsBaseUrl,
    getTestKey,
    suggestedServices
  };
}

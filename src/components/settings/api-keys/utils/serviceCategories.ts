
import { API_CATEGORIES } from '../constants';

export function getCategoryForService(serviceName: string): string {
  if (!serviceName) return '';
  
  for (const [category, categoryData] of Object.entries(API_CATEGORIES)) {
    if (categoryData.services.includes(serviceName)) {
      return category;
    }
  }
  
  // Default fallback to Other category
  return 'Other';
}

export function getAllServices(): string[] {
  const services: string[] = [];
  Object.values(API_CATEGORIES).forEach(categoryData => {
    services.push(...categoryData.services);
  });
  return services;
}

export function getServicesForCategory(category: string): string[] {
  return API_CATEGORIES[category]?.services || [];
}

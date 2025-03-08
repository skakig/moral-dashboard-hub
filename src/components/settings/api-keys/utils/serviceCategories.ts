
import { API_CATEGORIES } from '../constants';

export function getCategoryForService(serviceName: string): string {
  if (!serviceName) return '';
  
  for (const [category, services] of Object.entries(API_CATEGORIES)) {
    if (services.includes(serviceName)) {
      return category;
    }
  }
  
  // Default fallback to Other category
  return 'Other';
}

export function getAllServices(): string[] {
  return Object.values(API_CATEGORIES).flat();
}

export function getServicesForCategory(category: string): string[] {
  return API_CATEGORIES[category] || [];
}

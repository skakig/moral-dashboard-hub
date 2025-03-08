
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a human-readable format
 * @param dateString ISO date string or null/undefined
 * @param fallback String to return if dateString is null/undefined
 * @returns Formatted date string or fallback value
 */
export function formatDate(dateString: string | null | undefined, fallback: string = 'Never'): string {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
}

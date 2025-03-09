
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a more readable format
 * @param dateString - The date string to format
 * @returns Formatted date string or "Never" if null/undefined
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Never";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Generate a random ID (useful for temporary IDs)
 */
export function generateRandomId(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Convert a data URL to a Blob object
 */
export function dataURLtoBlob(dataURL: string): Blob {
  // Split the data URL to get the mime type and the data
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const byteCharacters = atob(parts[1]);
  
  // Convert the decoded string to a byte array
  const byteArrays = [];
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i));
  }
  
  // Create a blob from the byte array
  return new Blob([new Uint8Array(byteArrays)], { type: contentType });
}

/**
 * Convert a Blob to a data URL
 */
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


/**
 * Centralized error logging utility for meme-related operations
 * This can be expanded to include analytics, error tracking services, etc.
 */
export function logError(message: string, ...args: any[]) {
  // In development, show full error details
  console.error(`[Meme Error] ${message}`, ...args);
  
  // In the future, this could be expanded to:
  // 1. Send errors to a monitoring service
  // 2. Collect error statistics
  // 3. Format errors for better debugging
  // 4. Add context about the user/environment
}

/**
 * Parse and format specific error types
 */
export function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

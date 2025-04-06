
/**
 * Error handling utility for consistent error management across the application
 */

import { toast } from "sonner";

// Error types for categorizing different errors
export enum ErrorType {
  // Database-related errors
  DATABASE_TIMEOUT = 'DATABASE_TIMEOUT',
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  DATABASE_QUERY = 'DATABASE_QUERY',
  
  // API-related errors
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Authentication errors
  AUTH_ERROR = 'AUTH_ERROR',
  
  // Application errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Interface for structured error information
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  originalError?: any;
}

/**
 * Create a structured error with detailed information
 */
export function createError(
  type: ErrorType, 
  message: string, 
  originalError?: any, 
  context?: Record<string, any>
): ErrorDetails {
  // Log error to console for development
  console.error(`[${type}] ${message}`, {
    context,
    originalError,
    timestamp: new Date()
  });

  return {
    type,
    message,
    context,
    timestamp: new Date(),
    originalError
  };
}

/**
 * Process a Supabase error and categorize it
 */
export function processSupabaseError(error: any): ErrorDetails {
  // Default to unknown error
  let type = ErrorType.UNKNOWN_ERROR;
  let message = "An unexpected error occurred";
  
  // Look for specific error messages in different possible error structures
  const errorMessage = error?.message || error?.error?.message || error?.data?.message || '';
  const errorCode = error?.code || error?.error?.code || error?.data?.code || '';
  
  // Handle timeout errors - check multiple possible patterns
  if (
    errorMessage.includes('timeout') || 
    errorMessage.includes('timed out') || 
    errorCode === '57014' ||
    errorMessage.includes('canceled due to statement timeout')
  ) {
    type = ErrorType.DATABASE_TIMEOUT;
    message = "The database query timed out. Please try again with more specific filters or contact support.";
  } 
  // Handle connection errors
  else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    type = ErrorType.DATABASE_CONNECTION;
    message = "Failed to connect to the database. Please check your internet connection and try again.";
  }
  // Handle query errors
  else if (errorCode) {
    type = ErrorType.DATABASE_QUERY;
    message = `Database error: ${errorMessage || 'Unknown database error'}`;
  }
  
  return createError(type, message, error);
}

/**
 * Display a user-friendly error message
 */
export function displayError(error: ErrorDetails): void {
  let duration = 5000;
  
  // Show toast message with appropriate severity
  if (error.type === ErrorType.DATABASE_TIMEOUT) {
    duration = 8000; // Give more time to read timeout errors
  }
  
  toast.error(error.message, {
    description: error.type !== ErrorType.UNKNOWN_ERROR 
      ? `Error type: ${error.type}`
      : "Please try again or contact support if the problem persists",
    duration: duration
  });
}

/**
 * Log error to monitoring service (can be expanded later)
 */
export function logError(error: ErrorDetails): void {
  // Currently just console logs, but could be extended to send to a monitoring service
  console.error(`[ERROR LOG] ${error.type}:`, { 
    message: error.message,
    context: error.context,
    timestamp: error.timestamp,
    originalError: error.originalError
  });
  
  // TODO: Send to monitoring service when available
  // sendToMonitoringService(error);
}

/**
 * Complete error handling flow - process, display, and log
 */
export function handleError(error: any, context?: Record<string, any>): ErrorDetails {
  // Process the error to get structured information
  const errorDetails = error.type 
    ? { ...error, context: { ...error.context, ...context }} 
    : processSupabaseError(error);
  
  // Display error to the user
  displayError(errorDetails);
  
  // Log the error
  logError(errorDetails);
  
  return errorDetails;
}


import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ErrorDetails, ErrorType } from "@/utils/errorHandling";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error: ErrorDetails | Error | null | undefined;
  title?: string;
  onRetry?: () => Promise<void> | void;
  variant?: "default" | "destructive";
  showRetry?: boolean;
  className?: string; // Added className prop
}

export function ErrorDisplay({ 
  error, 
  title = "An error occurred", 
  onRetry, 
  variant = "destructive",
  showRetry = true,
  className
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error) return null;

  // Fix the toString error by explicitly checking if message property exists
  // If it does, use it directly; otherwise convert to string safely
  const errorMessage = 'message' in error ? error.message : String(error);
  const errorType = 'type' in error ? error.type : ErrorType.UNKNOWN_ERROR;
  
  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (e) {
      console.error("Error during retry:", e);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Alert variant={variant} className={cn("mb-6", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium">{errorMessage}</p>
          {errorType !== ErrorType.UNKNOWN_ERROR && (
            <p className="text-xs text-muted-foreground mt-1">Error type: {errorType}</p>
          )}
        </div>
        {showRetry && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            disabled={isRetrying}
            className="ml-4"
          >
            {isRetrying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}


import { Progress } from "@/components/ui/progress";

interface APIKeyValidationProgressProps {
  loading: boolean;
  progress: number;
}

export function APIKeyValidationProgress({ loading, progress }: APIKeyValidationProgressProps) {
  if (!loading || progress === 0) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Validating API key...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}

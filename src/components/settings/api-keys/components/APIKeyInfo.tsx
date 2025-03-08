
import { Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface APIKeyInfoProps {
  baseUrl?: string;
  lastValidated?: string;
  hasValidationErrors: boolean;
  validationErrors?: string[];
}

export function APIKeyInfo({ 
  baseUrl,
  lastValidated,
  hasValidationErrors,
  validationErrors = []
}: APIKeyInfoProps) {
  return (
    <div className="space-y-2">
      {baseUrl && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Base URL</span>
          <span className="truncate max-w-[200px] flex items-center">
            {baseUrl}
            <a href={baseUrl} target="_blank" rel="noreferrer" className="ml-1 inline-block">
              <ExternalLink className="h-3 w-3" />
            </a>
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Last Validated</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {formatDate(lastValidated)}
        </span>
      </div>
      
      {hasValidationErrors && (
        <div className="pt-2">
          <Badge variant="outline" className="text-amber-600 border-amber-600 flex gap-1 items-center">
            <AlertCircle className="h-3 w-3" />
            Has Validation Warnings
          </Badge>
        </div>
      )}
    </div>
  );
}

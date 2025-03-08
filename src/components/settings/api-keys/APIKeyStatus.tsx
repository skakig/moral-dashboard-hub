
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, CheckCircle2, Calendar, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface APIKeyStatusProps {
  isConfigured: boolean;
  isActive: boolean;
  lastValidated: string | null;
  createdAt: string | null;
  isToggling: boolean;
  toggleActiveStatus: () => Promise<void>;
}

export function APIKeyStatus({ 
  isConfigured, 
  isActive, 
  lastValidated, 
  createdAt,
  isToggling, 
  toggleActiveStatus 
}: APIKeyStatusProps) {
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <>
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          API key configured successfully
          {lastValidated && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs block text-green-600 cursor-help flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1" /> 
                  Last validated: {formatDate(lastValidated)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Full date: {new Date(lastValidated).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {createdAt && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs block text-green-600 cursor-help flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> 
                  Added: {formatDate(createdAt)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Full date: {new Date(createdAt).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </AlertDescription>
      </Alert>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Active Status</span>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={isActive} 
            onCheckedChange={toggleActiveStatus}
            disabled={isToggling}
          />
          <span className="text-sm text-muted-foreground">
            {isActive ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    </>
  );
}

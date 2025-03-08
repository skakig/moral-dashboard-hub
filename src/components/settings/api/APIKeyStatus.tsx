
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface APIKeyStatusProps {
  isConfigured: boolean;
  isActive: boolean;
  lastValidated: string | null;
  isToggling: boolean;
  toggleActiveStatus: () => Promise<void>;
}

export function APIKeyStatus({ 
  isConfigured, 
  isActive, 
  lastValidated, 
  isToggling, 
  toggleActiveStatus 
}: APIKeyStatusProps) {
  return (
    <>
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          API key configured successfully
          {lastValidated && (
            <span className="text-xs block text-green-600">
              Last validated: {new Date(lastValidated).toLocaleString()}
            </span>
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

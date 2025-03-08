
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Key } from 'lucide-react';
import { APIKeyStatus } from './APIKeyStatus';
import { APIKeyFormFields } from './APIKeyFormFields';
import { useAPIKeyForm } from './useAPIKeyForm';

interface APIKeysFormProps {
  title: string;
  description: string;
  serviceName: string;
  category: string;
  baseUrl?: string;
  isConfigured?: boolean;
  isActive?: boolean;
  lastValidated?: string | null;
  onSuccess?: () => void;
}

export function APIKeysForm({ 
  title, 
  description, 
  serviceName, 
  category,
  baseUrl = '', 
  isConfigured = false, 
  isActive = true,
  lastValidated = null,
  onSuccess 
}: APIKeysFormProps) {
  const { 
    form, 
    loading, 
    showForm, 
    setShowForm, 
    error, 
    isToggling, 
    validationProgress, 
    needsBaseUrl,
    onSubmit, 
    toggleActiveStatus, 
    useDemoKey 
  } = useAPIKeyForm({
    serviceName,
    category,
    baseUrl,
    isConfigured,
    isActive,
    onSuccess
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {title}
          {isConfigured && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured && !showForm ? (
          <APIKeyStatus 
            isConfigured={isConfigured}
            isActive={isActive}
            lastValidated={lastValidated}
            isToggling={isToggling}
            toggleActiveStatus={toggleActiveStatus}
          />
        ) : (
          <APIKeyFormFields
            form={form}
            needsBaseUrl={needsBaseUrl}
            loading={loading}
            error={error}
            validationProgress={validationProgress}
            onSubmit={onSubmit}
            useDemoKey={useDemoKey}
            serviceName={serviceName}
          />
        )}
      </CardContent>
      {isConfigured && !showForm && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            Update API Key
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

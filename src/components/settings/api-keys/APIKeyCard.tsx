
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { APIKeyFormFields } from './APIKeyFormFields';
import { useAPIKeyForm } from './hooks/useAPIKeyForm';
import { APIKeyStatus } from './APIKeyStatus';
import { APIKeyCardHeader } from './components/APIKeyCardHeader';
import { APIKeyInfo } from './components/APIKeyInfo';
import { DeleteAPIKeyDialog } from './components/DeleteAPIKeyDialog';
import { PrimaryBadge } from './components/PrimaryBadge';

interface APIKeyCardProps {
  id: string;
  title: string;
  description: string;
  serviceName: string;
  category: string;
  baseUrl?: string;
  isConfigured: boolean;
  isActive: boolean;
  isPrimary: boolean;
  lastValidated?: string;
  createdAt?: string;
  validationErrors?: string[];
  onSuccess: () => void;
  onSetPrimary: (id: string) => void;
}

export function APIKeyCard({ 
  id,
  title, 
  description,
  serviceName,
  category,
  baseUrl = '',
  isConfigured = false,
  isActive = true,
  isPrimary = false,
  lastValidated,
  createdAt,
  validationErrors = [],
  onSuccess,
  onSetPrimary
}: APIKeyCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { 
    form, 
    showForm, 
    setShowForm, 
    loading, 
    error, 
    isToggling, 
    validationProgress, 
    needsBaseUrl,
    onSubmit,
    toggleActiveStatus,
    useDemoKey
  } = useAPIKeyForm({
    id,
    serviceName,
    category,
    baseUrl,
    isConfigured,
    isActive,
    isPrimary,
    onSuccess
  });
  
  const hasValidationErrors = validationErrors && validationErrors.length > 0;
  
  return (
    <>
      <Card className="relative">
        <PrimaryBadge show={isPrimary} />
        
        <APIKeyCardHeader 
          title={title}
          description={description}
          isPrimary={isPrimary}
          isActive={isActive}
          onEdit={() => setShowForm(true)}
          onSetPrimary={() => onSetPrimary(id)}
          onToggleStatus={toggleActiveStatus}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
        
        <CardContent>
          {showForm ? (
            <div className="mt-2">
              <APIKeyFormFields
                form={form}
                needsBaseUrl={needsBaseUrl}
                loading={loading}
                error={error}
                validationProgress={validationProgress}
                onSubmit={onSubmit}
                useDemoKey={useDemoKey}
                serviceName={serviceName}
                showPrimaryOption={true}
              />
              <div className="mt-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <APIKeyStatus 
                  isConfigured={isConfigured} 
                  isActive={isActive} 
                  lastValidated={lastValidated} 
                  createdAt={createdAt}
                  isToggling={isToggling}
                  toggleActiveStatus={toggleActiveStatus}
                />
              </div>
              
              <APIKeyInfo 
                baseUrl={baseUrl}
                lastValidated={lastValidated}
                hasValidationErrors={hasValidationErrors}
                validationErrors={validationErrors}
              />
            </div>
          )}
        </CardContent>
        
        {!showForm && (
          <CardFooter className="pt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit API Key
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <DeleteAPIKeyDialog
        id={id}
        title={title}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}

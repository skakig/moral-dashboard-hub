
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter,
  AlertDialogHeader, 
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Key, CheckCircle2, AlertCircle, MoreVertical, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { APIKeyStatus } from './APIKeyStatus';
import { APIKeyFormFields } from './APIKeyFormFields';
import { useAPIKeyForm } from './hooks/useAPIKeyForm';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface APIKeyCardProps {
  id: string;
  title: string;
  description?: string;
  serviceName: string;
  category: string;
  baseUrl?: string;
  isConfigured?: boolean;
  isActive?: boolean;
  isPrimary?: boolean;
  lastValidated?: string | null;
  createdAt?: string | null;
  validationErrors?: string[];
  onSuccess?: () => void;
  onDelete?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
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
  lastValidated = null,
  createdAt = null,
  validationErrors = [],
  onSuccess,
  onDelete,
  onSetPrimary
}: APIKeyCardProps) {
  const [showForm, setShowForm] = useState(!isConfigured);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { 
    form, 
    loading, 
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

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(id);
    } else {
      try {
        const { error } = await supabase.functions.invoke('delete-api-key', {
          body: { id }
        });
        
        if (error) {
          console.error('Error deleting API key:', error);
          toast.error(`Failed to delete ${serviceName} API key`);
          return;
        }
        
        toast.success(`${serviceName} API key deleted successfully`);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        console.error('Exception during API key deletion:', err);
        toast.error(`Failed to delete ${serviceName} API key`);
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const setPrimary = () => {
    if (onSetPrimary) {
      onSetPrimary(id);
    }
  };

  return (
    <Card className={isPrimary ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{title}</CardTitle>
            {isConfigured && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {isPrimary && (
              <Badge className="ml-2" variant="outline">Primary</Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isConfigured && (
                <>
                  <DropdownMenuItem onClick={() => setShowForm(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Key
                  </DropdownMenuItem>
                  {!isPrimary && (
                    <DropdownMenuItem onClick={setPrimary}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Set as Primary
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Key
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        
        {validationErrors && validationErrors.length > 0 && (
          <div className="mt-2 flex items-start gap-2 text-amber-500 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-medium">Validation Errors</p>
              <ul className="list-disc pl-5 text-xs">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-2 space-y-4">
        {isConfigured && !showForm ? (
          <APIKeyStatus 
            isConfigured={isConfigured}
            isActive={isActive}
            lastValidated={lastValidated}
            createdAt={createdAt}
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
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Update API Key
          </Button>
        </CardFooter>
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the API key for {serviceName}. 
              Any functions using this key will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

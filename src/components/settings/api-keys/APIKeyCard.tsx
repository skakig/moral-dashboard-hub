
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Star, Edit, Trash, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { APIKeyStatus } from './APIKeyStatus';
import { APIKeyFormFields } from './APIKeyFormFields';
import { useAPIKeyForm } from './hooks/useAPIKeyForm';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
  const [isDeleting, setIsDeleting] = useState(false);
  
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
  
  const handleDeleteAPIKey = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-api-key', {
        body: { id },
      });
      
      if (error) {
        console.error('Error deleting API key:', error);
        toast.error(`Failed to delete ${title} API key`);
        return;
      }
      
      toast.success(`${title} API key deleted successfully`);
      setIsDeleteDialogOpen(false);
      onSuccess();
    } catch (err: any) {
      console.error('Exception during delete:', err);
      toast.error(`Failed to delete ${title} API key: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const hasValidationErrors = validationErrors && validationErrors.length > 0;
  
  return (
    <>
      <Card className="relative">
        {isPrimary && (
          <div className="absolute top-0 right-0 -mt-2 -mr-2">
            <Badge className="bg-yellow-500">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Primary
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowForm(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                
                {!isPrimary && (
                  <DropdownMenuItem onClick={() => onSetPrimary(id)}>
                    <Star className="mr-2 h-4 w-4" />
                    Set as Primary
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={toggleActiveStatus}>
                  {isActive ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
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
                <APIKeyStatus isActive={isActive} />
              </div>
              
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
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {title} API key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAPIKey}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

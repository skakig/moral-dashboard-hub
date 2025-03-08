
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DeleteAPIKeyDialogProps {
  id: string;
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteAPIKeyDialog({ 
  id, 
  title, 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: DeleteAPIKeyDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
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
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Exception during delete:', err);
      toast.error(`Failed to delete ${title} API key: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete API Key</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the {title} API key? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}

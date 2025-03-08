
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FunctionMappingForm } from './FunctionMappingForm';
import { useAddFunctionMappingForm } from './useAddFunctionMappingForm';

interface AddFunctionMappingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableServices: string[];
  onSuccess?: () => void;
}

export function AddFunctionMappingDialog({ 
  isOpen, 
  onOpenChange, 
  availableServices, 
  onSuccess 
}: AddFunctionMappingDialogProps) {
  const { form, isLoading, error, onSubmit } = useAddFunctionMappingForm({ 
    onSuccess, 
    onOpenChange 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Function Mapping</DialogTitle>
          <DialogDescription>
            Map a custom function to an API service
          </DialogDescription>
        </DialogHeader>
        
        <FunctionMappingForm
          form={form}
          availableServices={availableServices}
          isLoading={isLoading}
          error={error}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

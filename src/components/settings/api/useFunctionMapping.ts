
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useFunctionMapping({ onSuccess }: { onSuccess?: () => void }) {
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [updatingFunction, setUpdatingFunction] = useState<string | null>(null);

  const updateFunctionMapping = async (
    functionName: string, 
    preferredService: string, 
    fallbackService?: string
  ) => {
    setUpdatingFunction(functionName);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-api-function-mapping', {
        body: {
          functionName,
          preferredService,
          fallbackService: fallbackService || null,
        },
      });
      
      if (error) {
        console.error('Error updating function mapping:', error);
        toast.error(`Failed to update function mapping`);
        return;
      }
      
      if (!data.success) {
        toast.error(data.error || `Failed to update function mapping`);
        return;
      }
      
      toast.success(`Function mapping updated successfully`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during function mapping update:', err);
      toast.error(`Failed to update function mapping`);
    } finally {
      setUpdatingFunction(null);
    }
  };

  return {
    isAddMappingOpen,
    setIsAddMappingOpen,
    updatingFunction,
    updateFunctionMapping
  };
}

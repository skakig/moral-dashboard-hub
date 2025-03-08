
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseAPIStatusToggleProps {
  serviceName: string;
  category: string;
  isConfigured: boolean;
  onSuccess?: () => void;
}

export function useAPIStatusToggle({ 
  serviceName, 
  category,
  isConfigured, 
  onSuccess 
}: UseAPIStatusToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const toggleActiveStatus = async () => {
    if (!isConfigured) return;
    
    setIsToggling(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-api-status', {
        body: {
          serviceName,
          category,
          isActive: false // We'll toggle this from its current state
        },
      });
      
      if (error) {
        console.error('Error toggling API status:', error);
        toast.error(`Failed to update ${serviceName} status`);
        return;
      }
      
      toast.success(`${serviceName} status updated successfully`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception toggling API status:', err);
      toast.error(`Failed to update ${serviceName} status`);
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isToggling,
    toggleActiveStatus
  };
}

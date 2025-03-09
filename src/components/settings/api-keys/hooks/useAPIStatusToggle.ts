
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseAPIStatusToggleProps {
  id?: string;
  serviceName: string;
  category: string;
  isConfigured: boolean;
  isActive?: boolean;
  onSuccess?: () => void;
}

export function useAPIStatusToggle({ 
  id,
  serviceName, 
  category,
  isConfigured,
  isActive = true,
  onSuccess 
}: UseAPIStatusToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const toggleActiveStatus = async () => {
    if (!isConfigured || !id) return;
    
    setIsToggling(true);
    try {
      console.log(`Toggling ${serviceName} status from ${isActive ? 'active' : 'inactive'} to ${!isActive ? 'active' : 'inactive'}`);
      
      const { data, error } = await supabase.functions.invoke('update-api-status', {
        body: {
          id,
          serviceName,
          category,
          isActive: !isActive // Toggle from current state
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

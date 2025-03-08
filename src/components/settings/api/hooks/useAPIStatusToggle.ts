
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryForService } from '../utils/serviceCategories';

interface UseAPIStatusToggleProps {
  serviceName: string;
  category: string;
  isConfigured?: boolean;
  onSuccess?: () => void;
}

export function useAPIStatusToggle({
  serviceName,
  category,
  isConfigured = false,
  onSuccess
}: UseAPIStatusToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const toggleActiveStatus = async () => {
    setIsToggling(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-api-status', {
        body: {
          serviceName,
          category: category || getCategoryForService(serviceName),
          isActive: !isConfigured || !isToggling,
        },
      });
      
      if (error) {
        console.error('Failed to toggle API status:', error);
        toast.error(`Failed to update ${serviceName} status`);
      } else {
        toast.success(`${serviceName} API ${isConfigured ? 'disabled' : 'enabled'} successfully`);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Failed to toggle API status:', error);
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

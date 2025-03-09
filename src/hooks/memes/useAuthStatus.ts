
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return { isAuthenticated };
}

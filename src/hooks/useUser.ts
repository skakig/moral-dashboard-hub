
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email?: string;
}

interface UserHookReturn {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useUser(): UserHookReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      setIsLoading(true);
      
      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setIsLoading(false);
        return;
      }
      
      if (!session) {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      // Get user profile to check role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error getting user profile:", profileError);
      }
      
      setUser({
        id: session.user.id,
        email: session.user.email
      });
      
      setIsAdmin(profileData?.role === 'admin');
      setIsLoading(false);
    }
    
    getUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email
        });
        
        // Check for admin role when auth state changes
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.role === 'admin');
          });
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { user, isAdmin, isLoading };
}


import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateUserEngagement, trackContentView } from "@/services/analyticsService";

export function useActivityTracking() {
  useEffect(() => {
    const trackActivity = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Track the page view
        const path = window.location.pathname;
        const contentType = path.split('/')[1] || 'home';
        const contentId = path;
        
        // Track the content view
        await trackContentView(user.id, contentId, 'article');
        
        // Calculate engagement score based on path
        let engagementScore = 1; // Default score for any page view
        
        if (path.includes('assessment')) {
          engagementScore = 5; // Higher score for assessment pages
        } else if (path.includes('profile')) {
          engagementScore = 3; // Medium score for profile updates
        } else if (path.includes('dashboard')) {
          engagementScore = 2; // Lower but still notable for dashboard views
        }
        
        // Update user engagement data
        await updateUserEngagement(user.id, 'page_view', engagementScore);
      } catch (error) {
        console.error("Error tracking activity:", error);
      }
    };
    
    // Track on initial page load
    trackActivity();
    
    // Set up listener for page changes if using client-side routing
    const handleRouteChange = () => {
      trackActivity();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  return null; // No need to return anything as this is just for tracking
}

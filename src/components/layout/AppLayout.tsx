
import React, { useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and auth is required
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate, requireAuth]);

  // Show loading state while checking authentication
  if (isLoading && requireAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-grow overflow-auto">
        <main className="p-0">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

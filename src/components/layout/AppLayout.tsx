
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeProvider } from "../ThemeProvider";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 overflow-auto">
            <main className="flex-1 p-6 md:px-8 w-full">{children}</main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
      <Sonner />
    </ThemeProvider>
  );
}

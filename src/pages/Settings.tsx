
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { APIKeysSection } from "@/components/settings/APIKeysSection";
import { AIConfigSettings } from "@/components/settings/AIConfigSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { BrandingSettings } from "@/components/settings/BrandingSettings";
import { Cog, Key, MessageSquare, Bell, Paintbrush } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check Supabase connection when the component mounts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setCheckingConnection(true);
        setConnectionError(null);
        
        // Use the edge function to check database schema
        const { data, error } = await supabase.functions.invoke('check-db-schema');
        
        if (error) {
          console.error("Supabase connection error:", error);
          setConnectionError(`Database connection error: ${error.message}`);
        } else if (!data || !data.success) {
          console.error("Database check failed:", data?.error || "Unknown error");
          setConnectionError(`Database connection error: ${data?.error || "Unknown error"}`);
        } else {
          console.log("Supabase connection successful:", data);
          
          // If there are missing tables but we have a success response, that means
          // we need to initialize the database
          if (data.missingColumns > 0) {
            console.log("Some database tables/columns need to be initialized");
            try {
              // Try to initialize tables
              const initResult = await supabase.functions.invoke('initialize-db-tables');
              
              if (initResult.error) {
                console.error("Error initializing database tables:", initResult.error);
                setConnectionError(`Failed to initialize database tables: ${initResult.error.message}`);
              } else {
                console.log("Database tables initialized successfully:", initResult.data);
              }
            } catch (initError: any) {
              console.error("Exception initializing database tables:", initError);
              setConnectionError(`Failed to initialize database tables: ${initError.message}`);
            }
          }
        }
      } catch (err: any) {
        console.error("Exception checking Supabase connection:", err);
        setConnectionError(`Database connection error: ${err.message}`);
      } finally {
        setCheckingConnection(false);
      }
    };
    
    checkConnection();
  }, []);

  const handleRetryConnection = () => {
    window.location.reload();
  };

  const handleInitializeTables = async () => {
    try {
      setCheckingConnection(true);
      setConnectionError(null);
      
      // Call the initialize tables edge function
      const { data, error } = await supabase.functions.invoke('initialize-db-tables');
      
      if (error) {
        console.error("Error initializing database tables:", error);
        setConnectionError(`Failed to initialize database tables: ${error.message}`);
      } else {
        console.log("Database tables initialized successfully:", data);
        // Reload page to check if initialization worked
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Exception initializing database tables:", err);
      setConnectionError(`Failed to initialize database tables: ${err.message}`);
    } finally {
      setCheckingConnection(false);
    }
  };

  if (connectionError) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure The Moral Hierarchy system settings
            </p>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>{connectionError}</p>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryConnection}
                >
                  Retry Connection
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleInitializeTables}
                >
                  Initialize Database Tables
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure The Moral Hierarchy system settings
          </p>
        </div>

        {checkingConnection ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Checking database connection...</span>
          </div>
        ) : (
          <Tabs defaultValue="api-keys" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">
                <div className="flex items-center gap-1">
                  <Cog className="h-4 w-4" />
                  <span className="hidden sm:inline">General</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="branding">
                <div className="flex items-center gap-1">
                  <Paintbrush className="h-4 w-4" />
                  <span className="hidden sm:inline">Branding</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="api-keys">
                <div className="flex items-center gap-1">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">API Keys</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="ai">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Config</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <div className="flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <BrandingSettings />
            </TabsContent>
            
            <TabsContent value="api-keys" className="space-y-4">
              <APIKeysSection />
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4">
              <AIConfigSettings />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

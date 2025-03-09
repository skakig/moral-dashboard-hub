
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { APIKeysSection } from "@/components/settings/APIKeysSection";
import { AIConfigSettings } from "@/components/settings/AIConfigSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Cog, Key, MessageSquare, Bell } from "lucide-react";
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
        
        // Simple query to test connection
        const { data, error } = await supabase.from('_sql_execution').insert({
          query: "SELECT 1 as connection_test;"
        }).select();
        
        if (error) {
          console.error("Supabase connection error:", error);
          setConnectionError(`Database connection error: ${error.message}`);
        } else {
          console.log("Supabase connection successful:", data);
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
              <Button 
                variant="outline" 
                size="sm" 
                className="self-start mt-2"
                onClick={handleRetryConnection}
              >
                Retry Connection
              </Button>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <div className="flex items-center gap-1">
                  <Cog className="h-4 w-4" />
                  <span className="hidden sm:inline">General</span>
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

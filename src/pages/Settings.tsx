
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { APIKeysSection } from "@/components/settings/APIKeysSection";
import { AIConfigSettings } from "@/components/settings/AIConfigSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Cog, Key, MessageSquare, Bell } from "lucide-react";

export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure The Moral Hierarchy system settings
          </p>
        </div>

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
      </div>
    </AppLayout>
  );
}

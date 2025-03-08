
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { APIKeysSection } from "@/components/settings/APIKeysSection";
import { AIConfigSettings } from "@/components/settings/AIConfigSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

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

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="ai">AI Configuration</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart3, Gauge } from "lucide-react";
import { APIFunctionMapping } from "@/components/settings/api/APIFunctionMapping";
import { APIUsageStats } from "@/components/settings/APIUsageStats";
import { APIRateLimits } from "@/components/settings/APIRateLimits";
import { APIKeysTabContent } from "@/components/settings/api/APIKeysTabContent";
import { useAPIData } from "@/components/settings/api/useAPIData";

export function APIKeysSection() {
  const { apiKeysLoading, apiData, fetchApiKeysStatus } = useAPIData();

  return (
    <>
      {apiKeysLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="mappings">Function Mapping</TabsTrigger>
            <TabsTrigger value="usage">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Usage Stats</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="limits">
              <div className="flex items-center gap-1">
                <Gauge className="h-4 w-4" />
                <span>Rate Limits</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="keys" className="space-y-4">
            <APIKeysTabContent 
              apiKeysByCategory={apiData.apiKeysByCategory}
              onRefresh={fetchApiKeysStatus}
            />
          </TabsContent>
          
          <TabsContent value="mappings">
            <APIFunctionMapping 
              functionMappings={apiData.functionMappings}
              apiKeys={apiData.apiKeysByCategory}
              onSuccess={fetchApiKeysStatus}
            />
          </TabsContent>
          
          <TabsContent value="usage">
            <APIUsageStats 
              usageStats={apiData.usageStats}
              onRefresh={fetchApiKeysStatus}
            />
          </TabsContent>
          
          <TabsContent value="limits">
            <APIRateLimits 
              rateLimits={apiData.rateLimits}
              onSuccess={fetchApiKeysStatus}
            />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}

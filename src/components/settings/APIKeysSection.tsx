
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart3, Gauge, AlertCircle, RefreshCw, InfoIcon, Key, GitBranch } from "lucide-react";
import { APIFunctionMapping } from "@/components/settings/api-keys/APIFunctionMapping";
import { APIUsageStats } from "@/components/settings/APIUsageStats";
import { APIRateLimits } from "@/components/settings/APIRateLimits";
import { APIKeysOverview } from "@/components/settings/api-keys/APIKeysOverview";
import { useAPIData } from "@/components/settings/api-keys/hooks/useAPIData";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect } from "react";

export function APIKeysSection() {
  const { apiKeysLoading, loadError, apiData, reloadApiData } = useAPIData();

  // Automatically refresh data when component mounts to ensure fresh data
  useEffect(() => {
    reloadApiData();
  }, []);

  const isEmptyData = !apiData || 
    (Object.keys(apiData.apiKeysByCategory).length === 0 && 
     apiData.functionMappings.length === 0 &&
     apiData.rateLimits.length === 0);

  return (
    <>
      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading API keys</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{loadError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="self-start"
              onClick={reloadApiData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!loadError && isEmptyData && !apiKeysLoading && (
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No API Configuration Found</AlertTitle>
          <AlertDescription>
            No API keys or configurations have been added yet. Add your first API key to get started.
            <div className="mt-2">
              <strong>Tip:</strong> You can add a test key by using the format "TEST_your-key" to verify the system is working.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {apiKeysLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="keys">
              <div className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API Keys</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="mappings">
              <div className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                <span className="hidden sm:inline">Function Mapping</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="usage">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Usage Stats</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="limits">
              <div className="flex items-center gap-1">
                <Gauge className="h-4 w-4" />
                <span className="hidden sm:inline">Rate Limits</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="keys" className="space-y-4">
            <APIKeysOverview 
              apiKeysByCategory={apiData.apiKeysByCategory || {}}
              onRefresh={reloadApiData}
            />
          </TabsContent>
          
          <TabsContent value="mappings">
            <APIFunctionMapping 
              functionMappings={apiData.functionMappings || []}
              apiKeys={apiData.apiKeysByCategory || {}}
              onSuccess={reloadApiData}
            />
          </TabsContent>
          
          <TabsContent value="usage">
            <APIUsageStats 
              usageStats={apiData.usageStats || { byService: {}, byCategory: {} }}
              onRefresh={reloadApiData}
            />
          </TabsContent>
          
          <TabsContent value="limits">
            <APIRateLimits 
              rateLimits={apiData.rateLimits || []}
              onSuccess={reloadApiData}
            />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}

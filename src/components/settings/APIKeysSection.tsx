
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldAlert, Loader2, RefreshCw, Plus, Gauge, BarChart3 } from "lucide-react";
import { APIKeysForm } from "@/components/settings/api/APIKeysForm";
import { APIFunctionMapping } from "@/components/settings/api/APIFunctionMapping";
import { APIUsageStats } from "@/components/settings/APIUsageStats";
import { APIRateLimits } from "@/components/settings/APIRateLimits";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { APIKeyFormDialog } from "@/components/settings/api/APIKeyFormDialog";

const API_CATEGORIES = {
  "Text Generation": ["OpenAI", "Anthropic", "Mistral AI", "Other Text AI"],
  "Voice Generation": ["ElevenLabs", "OpenAI TTS", "Other Voice AI"],
  "Image Generation": ["Stable Diffusion", "DALL-E", "Other Image AI"],
  "Video Generation": ["RunwayML", "Pika Labs", "Other Video AI"],
  "Social Media": ["Meta API", "Instagram API", "Facebook API", "TikTok API", "YouTube API", "Twitter/X API", "Other Social API"]
};

export function APIKeysSection() {
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [apiData, setApiData] = useState<any>({
    apiKeysByCategory: {},
    functionMappings: [],
    usageStats: { byService: {}, byCategory: {} },
    rateLimits: []
  });
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchApiKeysStatus();
  }, []);

  const fetchApiKeysStatus = async () => {
    setApiKeysLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-api-keys-status');
      
      if (error) {
        console.error('Failed to fetch API keys status:', error);
        toast.error('Unable to load API key status');
      } else if (data && data.success) {
        setApiData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys status:', error);
      toast.error('Unable to load API key status');
    } finally {
      setApiKeysLoading(false);
    }
  };

  const openAddKeyDialog = (category: string) => {
    setSelectedCategory(category);
    setIsAddKeyDialogOpen(true);
  };

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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">AI & Social Media API Keys</h3>
              <Button onClick={() => fetchApiKeysStatus()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {Object.entries(API_CATEGORIES).map(([category, services]) => (
              <Card key={category} className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{category}</CardTitle>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => openAddKeyDialog(category)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add API Key
                    </Button>
                  </div>
                  <CardDescription>
                    Configure API keys for {category.toLowerCase()} services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apiData.apiKeysByCategory[category]?.map((keyData: any) => (
                      <APIKeysForm
                        key={keyData.id}
                        title={keyData.serviceName}
                        description={`${category} service`}
                        serviceName={keyData.serviceName}
                        category={category}
                        baseUrl={keyData.baseUrl}
                        isConfigured={keyData.isConfigured}
                        isActive={keyData.isActive}
                        lastValidated={keyData.lastValidated}
                        onSuccess={fetchApiKeysStatus}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New {selectedCategory} API Key</DialogTitle>
                </DialogHeader>
                <APIKeyFormDialog 
                  category={selectedCategory}
                  onSuccess={() => {
                    fetchApiKeysStatus();
                    setIsAddKeyDialogOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  API Key Security
                </CardTitle>
                <CardDescription>
                  Information about how your API keys are stored and used
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
                  <p className="font-medium mb-2">API Key Security Information</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>API keys are stored securely in your Supabase database</li>
                    <li>Keys are never exposed to the client-side code</li>
                    <li>All API requests are made through secure Edge Functions</li>
                    <li>Keys can be rotated or revoked at any time</li>
                    <li>For testing, you can use "TEST_" prefixed keys</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
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

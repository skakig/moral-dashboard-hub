
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FunctionMappingSection } from "./FunctionMappingSection";
import { APIUsageStats } from "./APIUsageStats";
import { APIRateLimits } from "./APIRateLimits";

export function APIKeysSection() {
  const [activeTab, setActiveTab] = useState("api-keys");
  
  // Format usageStats to match the expected interface
  const usageStats = {
    byService: {
      "OpenAI": { requests: 250, successRate: 98.5, cost: 12.50 },
      "ElevenLabs": { requests: 120, successRate: 95.2, cost: 8.75 },
      "StableDiffusion": { requests: 85, successRate: 97.0, cost: 5.30 }
    },
    byCategory: {
      "Text Generation": { requests: 150, successRate: 98.0, cost: 7.50 },
      "Image Generation": { requests: 85, successRate: 97.0, cost: 5.30 },
      "Voice Generation": { requests: 120, successRate: 95.2, cost: 8.75 },
      "Analysis": { requests: 100, successRate: 99.0, cost: 5.00 }
    }
  };
  
  // Format rateLimits to match the expected interface
  const rateLimits = [
    { 
      id: "1", 
      service_name: "OpenAI", 
      requests_used: 12,
      request_limit: 100, 
      reset_date: new Date(Date.now() + 3600000).toISOString()
    },
    { 
      id: "2", 
      service_name: "OpenAI", 
      requests_used: 250,
      request_limit: 1000, 
      reset_date: new Date(Date.now() + 86400000).toISOString()
    },
    { 
      id: "3", 
      service_name: "ElevenLabs", 
      requests_used: 5,
      request_limit: 50, 
      reset_date: new Date(Date.now() + 3600000).toISOString()
    },
    { 
      id: "4", 
      service_name: "StableDiffusion", 
      requests_used: 85,
      request_limit: 300, 
      reset_date: new Date(Date.now() + 86400000).toISOString()
    }
  ];
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="function-mapping">Function Mapping</TabsTrigger>
          <TabsTrigger value="usage-stats">Usage & Limits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys" className="space-y-4 mt-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <h3 className="text-lg font-medium">OpenAI API Key</h3>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="sk-..."
                />
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Save
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Used for content generation and AI features.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-lg font-medium">Anthropic API Key</h3>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="sk-ant-..."
                />
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Save
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Used for Claude AI features and moral analysis.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-lg font-medium">ElevenLabs API Key</h3>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="..."
                />
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Save
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Used for voice generation and audio content.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-lg font-medium">Stability AI Key</h3>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="sk-..."
                />
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Save
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Used for image generation with Stable Diffusion.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="function-mapping" className="space-y-4 mt-6">
          <FunctionMappingSection />
        </TabsContent>
        
        <TabsContent value="usage-stats" className="space-y-4 mt-6">
          <APIUsageStats usageStats={usageStats} />
          <APIRateLimits rateLimits={rateLimits} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
